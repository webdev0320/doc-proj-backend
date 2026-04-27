const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('Users:', JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers();
