const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questions = [
  'Is 1008 Underwriting Transmittal Summary part of the package?',
  'Is Application 1003 part of the package?',
  'Is Appraisal part of the package?',
  'Is Closing Disclosure part of the package?',
  'Is Deed part of the package?',
  'Is Final Title Policy part of the package?',
  'Is Flood Certificate part of the package?',
  'Is Legal Description part of the package?',
];

async function main() {
  for (const text of questions) {
    const existing = await prisma.checklistItem.findFirst({ where: { text } });
    if (existing) {
      console.log(`SKIP (exists): ${text}`);
    } else {
      await prisma.checklistItem.create({ data: { text } });
      console.log(`INSERTED: ${text}`);
    }
  }
  const total = await prisma.checklistItem.count();
  console.log(`Total checklist items in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
