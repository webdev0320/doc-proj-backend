require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobId = process.argv[2];
  if (!blobId) {
    console.error('Usage: node countPages.js <blobId>');
    process.exit(2);
  }

  const count = await prisma.page.count({ where: { blobId } });
  console.log(JSON.stringify({ success: true, blobId, pages: count }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
