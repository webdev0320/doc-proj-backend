require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blobs = await prisma.blob.findMany({
    select: { id: true, filename: true, status: true },
    take: 10,
  });
  console.log('Blobs:', JSON.stringify(blobs, null, 2));

  const count = await prisma.extractedValue.count();
  console.log('Total extracted values:', count);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
