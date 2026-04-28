const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promote(email) {
  if (!email) {
    console.error('Please provide an email: node promote-admin.js user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ Success! User ${user.email} is now an ADMIN.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

promote(process.argv[2]);
