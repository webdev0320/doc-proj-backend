require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobId = process.argv[2];
  if (!blobId) {
    console.error('Usage: node listAuditLogs.js <blobId>');
    process.exit(2);
  }

  const entries = await prisma.auditLog.findMany({
    where: { blobId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(JSON.stringify({ success: true, data: entries }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
