require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobId = process.argv[2];
  if (!blobId) {
    console.error('Usage: node getEngineError.js <blobId>');
    process.exit(2);
  }

  const entry = await prisma.auditLog.findFirst({
    where: { blobId, action: 'ENGINE_FAILED' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, payload: true, createdAt: true }
  });

  if (!entry) {
    console.log(JSON.stringify({ success: true, data: null }, null, 2));
  } else {
    console.log(JSON.stringify({ success: true, data: entry }, null, 2));
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => process.exit());
