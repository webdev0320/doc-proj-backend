const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const blobs = await prisma.blob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      filename: true,
      s3Path: true,
      status: true,
      pageCount: true,
      createdAt: true
    }
  });
  console.log('Recent blobs in DB:', JSON.stringify(blobs, null, 2));
  process.exit(0);
}

check();
