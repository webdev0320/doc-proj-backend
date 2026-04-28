const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
  console.log('🔄 Resetting database...');
  
  try {
    // Order matters because of foreign keys
    await prisma.auditLog.deleteMany();
    await prisma.documentPage.deleteMany();
    await prisma.document.deleteMany();
    await prisma.page.deleteMany();
    await prisma.blob.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All data cleared.');

    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@idp.local',
        password: hashedAdminPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      }
    });

    console.log('✅ Default admin created: admin@idp.local / admin123');
  } catch (err) {
    console.error('❌ Error during reset:', err);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
