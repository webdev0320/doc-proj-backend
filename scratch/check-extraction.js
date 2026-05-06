const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const pages = await prisma.page.findMany({
    where: { NOT: { extractedData: null } },
    take: 5,
    select: { id: true, aiLabel: true, extractedData: true }
  });
  console.log('Pages with data:', JSON.stringify(pages, null, 2));
  
  const allPages = await prisma.page.count();
  console.log('Total pages:', allPages);
  
  const pagesWithDataCount = await prisma.page.count({
    where: { NOT: { extractedData: null }, extractedData: { not: '' } }
  });
  console.log('Pages with non-empty extractedData:', pagesWithDataCount);

  process.exit(0);
}

check();
