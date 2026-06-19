const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const blob = await prisma.blob.findFirst({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    include: {
      pages: {
        take: 3,
        select: {
          id: true,
          pageIndex: true,
          aiLabel: true,
          extractedData: true
        }
      }
    }
  });
  console.log('Blob details:', JSON.stringify(blob, null, 2));
  process.exit(0);
}

check();
