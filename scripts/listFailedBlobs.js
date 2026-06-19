require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const blobs = await prisma.blob.findMany({
    where: { status: 'FAILED' },
    select: { id: true, filename: true, s3Path: true, progress: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  console.log(JSON.stringify({ count: blobs.length, data: blobs }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
