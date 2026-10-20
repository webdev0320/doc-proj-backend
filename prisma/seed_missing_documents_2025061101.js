const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BLOB_ID = "cmv3y899200013uyg8cyjk586";
const LOAN_NUMBER = "2025061101";

// [Document Name, Category] from the Missing Document List Report
const REPORT = [
  ["1003 Loan Application", "YES"],
  ["Acknowledgement of Receipt of the Closing Disclosure", "NO"],
  ["Addendum to Closing Disclosure", "NO"],
  ["Addendum to Loan Application", "NO"],
  ["California All-Purpose Acknowledgement", "NO"],
  ["Clear to Close Certificate", "NO"],
  ["Closing Disclosure", "YES"],
  ["Compliance Agreement", "YES"],
  ["Evidence Of Joint Application", "NO"],
  ["GA Foreclosure Disclosure", "NO"],
  ["Note", "YES"],
  ["Note Allonge", "YES"],
  ["Trust Certification", "NO"],
];

const questionText = (name) => `Is ${name} Available In Package ?`;

async function main() {
  const blob = await prisma.blob.findUnique({
    where: { id: BLOB_ID },
    select: { id: true, filename: true, batchNo: true, pageCount: true },
  });
  if (!blob) {
    console.error("Blob not found: " + BLOB_ID);
    process.exit(1);
  }
  console.log("blob found:", blob.filename, "| pages:", blob.pageCount);

  const updated = await prisma.blob.update({
    where: { id: BLOB_ID },
    data: { batchNo: LOAN_NUMBER },
  });
  console.log("batchNo:", blob.batchNo, "->", updated.batchNo);

  const items = [];
  for (const [name, category] of REPORT) {
    const text = questionText(name);
    let item = await prisma.checklistItem.findFirst({ where: { text } });
    if (!item) {
      item = await prisma.checklistItem.create({ data: { text } });
      console.log("  + checklist item:", text);
    }
    items.push({ name, category, item });
  }
  console.log("checklist items ready:", items.length);

  const documents = await prisma.document.findMany({
    where: { blobId: BLOB_ID },
    select: { id: true, name: true, documentType: true },
    orderBy: { createdAt: "asc" },
  });
  console.log("documents in blob:", documents.length);

  let written = 0;
  for (const doc of documents) {
    for (const { name, category, item } of items) {
      const answer = category === "YES" ? "Yes" : "No";
      await prisma.documentChecklistResult.upsert({
        where: {
          documentId_checklistItemId: {
            documentId: doc.id,
            checklistItemId: item.id,
          },
        },
        create: {
          documentId: doc.id,
          checklistItemId: item.id,
          answer,
          flagged: false,
        },
        update: {
          answer,
        },
      });
      written++;
    }
  }
  console.log("results written:", written);

  const total = await prisma.documentChecklistResult.count({
    where: { document: { blobId: BLOB_ID } },
  });
  console.log("total DocumentChecklistResult rows for blob:", total);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
