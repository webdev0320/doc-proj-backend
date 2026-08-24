process.env.DATABASE_URL = 'postgresql://appuser:doc-project0320%40123@srv1780074.hstgr.cloud:5432/appdb';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check how many records exist
  const count = await prisma.extractedValue.count({
    where: { blobId: 'cmt45c5iy0001i7yxrk5bznsd' },
  });
  console.log(`Existing rows for blob: ${count}`);

  // Check what pageIds exist
  const rows = await prisma.extractedValue.findMany({
    where: { blobId: 'cmt45c5iy0001i7yxrk5bznsd' },
    select: { pageId: true, documentName: true, fieldName: true },
    take: 20,
  });
  console.log('Existing rows:', JSON.stringify(rows, null, 2));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
