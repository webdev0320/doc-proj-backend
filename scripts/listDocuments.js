require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobId = process.argv[2];
  if (!blobId) {
    console.error('Usage: node listDocuments.js <blobId>');
    process.exit(2);
  }

  const docs = await prisma.document.findMany({ where: { blobId }, include: { pages: true } });
  console.log(JSON.stringify({ success: true, count: docs.length, data: docs }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
