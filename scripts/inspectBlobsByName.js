require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node inspectBlobsByName.js <name-substring>');
    process.exit(2);
  }

  const blobs = await prisma.blob.findMany({ where: { filename: name }, orderBy: { createdAt: 'desc' } });
  const byS3 = await prisma.blob.findMany({ where: { s3Path: { contains: name } }, orderBy: { createdAt: 'desc' } });
  const all = [...new Map([...blobs, ...byS3].map(b => [b.id, b])).values()];

  const out = [];
  for (const b of all) {
    const pages = await prisma.page.count({ where: { blobId: b.id } });
    const docs = await prisma.document.count({ where: { blobId: b.id } });
    out.push({ id: b.id, filename: b.filename, s3Path: b.s3Path, status: b.status, pages, documents: docs, createdAt: b.createdAt });
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
