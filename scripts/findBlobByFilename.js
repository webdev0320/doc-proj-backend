require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node findBlobByFilename.js <filename-substring>');
    process.exit(2);
  }

  const blob = await prisma.blob.findFirst({
    where: { s3Path: { contains: name } },
    select: { id: true, filename: true, s3Path: true, status: true, progress: true }
  });

  console.log(JSON.stringify({ success: true, data: blob }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
