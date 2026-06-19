require('dotenv').config({ path: __dirname + '/../.env' });
const { prisma } = require('../src/lib/prisma');

async function main() {
  const logs = await prisma.auditLog.findMany({
    where: { action: { in: ['ENGINE_FAILED', 'ENGINE_FAILED_TRIGGER', 'ENGINE_ATTEMPT', 'ENGINE_REQUEUE', 'ENGINE_TRIGGERED'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { blob: { select: { id: true, filename: true, status: true } } }
  });
  console.log(JSON.stringify({ count: logs.length, data: logs }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit());
