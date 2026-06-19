require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobId = process.argv[2];
  if (!blobId) {
    console.error('Usage: node triggerEngineOnce.js <blobId>');
    process.exit(2);
  }

  const blob = await prisma.blob.findUnique({ where: { id: blobId } });
  if (!blob) {
    console.error('Blob not found');
    process.exit(2);
  }

  const engineUrl = `${process.env.ENGINE_URL || 'http://localhost:8000'}/process`;
  try {
    console.log('Posting to engine URL:', engineUrl);
    const storageSettings = await (require('../src/utils/storage').getStorageConfig());
    const res = await axios.post(engineUrl, {
      blob_id: blob.id,
      storage_path: blob.s3Path,
      storage_settings: storageSettings
    }, { timeout: 30000 });
    console.log('Engine responded:', res.status, res.data);
    await prisma.auditLog.create({ data: { blobId: blob.id, action: 'ENGINE_TRIGGERED_MANUAL', payload: JSON.stringify({ status: res.status, data: res.data }), performedBy: 'manual-script' } });
  } catch (err) {
    const errInfo = {
      message: err.message,
      code: err.code || null,
      status: err.response?.status || null,
      responseData: err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : null,
      stack: err.stack || null
    };
    if (errInfo.responseData && errInfo.responseData.length > 5000) errInfo.responseData = errInfo.responseData.slice(0,5000) + '...<truncated>';
    console.error('Engine POST failed:', JSON.stringify(errInfo, null, 2));
    await prisma.auditLog.create({ data: { blobId: blob.id, action: 'ENGINE_MANUAL_ATTEMPT', payload: JSON.stringify(errInfo), performedBy: 'manual-script' } });
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
