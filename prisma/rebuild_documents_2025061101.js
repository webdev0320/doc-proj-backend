const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BLOB_ID = "cmv3y899200013uyg8cyjk586";

// [documentType, pageFrom, pageTo] — page numbers are 1-based PDF pages
const INDEXING = [
  ["Other", 1, 1],
  ["Mortgage Deed", 2, 13],
  ["Legal Description", 14, 14],
  ["Note", 15, 18],
  ["Allonge", 19, 19],
  ["Affidavit", 20, 22],
  ["1003 URLA", 23, 33],
  ["ATTESTATION", 34, 37],
  ["Closing Disclosure", 38, 42],
  ["Loan Agreement", 43, 45],
  ["BORROWER'S AUTHORIZATION", 46, 48],
  ["Form 4506", 49, 50],
  ["Closing Instructions", 51, 60],
  ["HAZARD INSURANCE AUTHORIZATION", 61, 62],
  ["W9", 63, 71],
  ["AMORTIZATION SCHEDULE", 72, 79],
  ["COMPUANCE AGREEMENT", 80, 81],
  ["Mortgage Loan Welcome Letter", 82, 87],
  ["USA PATRIOT ACT", 88, 89],
  ["ESCROW WAIVER", 90, 91],
  ["HMDA Required Information", 92, 92],
  ["NOTICE to ATTORNEY", 93, 99],
  ["NOTICE OF RIGHT TO CANCEL", 100, 101],
  ["AFFIDAVIT", 102, 104],
  ["PAYMENT LETTER TO BORROWER", 105, 107],
  ["TAX RECORD INFORMATION SHEET", 108, 111],
  ["NOTICE OF RIGHT TO TRANSFER", 112, 112],
  ["BORROWER(S) FINAL CLOSING STATEMENT", 113, 122],
  ["NAME AFFIDAVIT", 123, 127],
  ["HOI", 128, 133],
];

// [Document Name, Category] — Missing Document List Report
const MISSING = [
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

const rangeLabel = (from, to) => (from === to ? `(p.${from})` : `(p.${from}-${to})`);

async function main() {
  const blob = await prisma.blob.findUnique({
    where: { id: BLOB_ID },
    select: { id: true, filename: true, userId: true, pageCount: true, batchNo: true },
  });
  if (!blob) {
    console.error("Blob not found: " + BLOB_ID);
    process.exit(1);
  }
  console.log("blob:", blob.filename, "| pages:", blob.pageCount, "| batchNo:", blob.batchNo);

  const pages = await prisma.page.findMany({
    where: { blobId: BLOB_ID },
    orderBy: { pageIndex: "asc" },
    select: { id: true, pageIndex: true },
  });
  const pageByIndex = new Map(pages.map((p) => [p.pageIndex, p.id]));
  console.log("pages loaded:", pages.length);

  // 1. Replace the AI documents (cascades document_pages + checklist results)
  const removed = await prisma.document.deleteMany({ where: { blobId: BLOB_ID } });
  console.log("\nremoved documents:", removed.count);

  // 2. Create one document per indexing entry + relink pages
  const pageToDoc = new Map();
  let links = 0;
  for (const [type, from, to] of INDEXING) {
    const doc = await prisma.document.create({
      data: {
        userId: blob.userId,
        blobId: BLOB_ID,
        name: `${type} ${rangeLabel(from, to)}`,
        documentType: type,
        status: "AI_CLASSIFIED",
      },
    });

    const data = [];
    for (let pn = from; pn <= to; pn++) {
      const pageId = pageByIndex.get(pn - 1);
      if (!pageId) continue;
      data.push({ documentId: doc.id, pageId, order: pn - from });
      pageToDoc.set(pageId, doc.id);
    }
    if (data.length) {
      await prisma.documentPage.createMany({ data, skipDuplicates: true });
      links += data.length;
    }
    console.log(`  ${type.padEnd(36)} p${from}-${to}  -> ${data.length} page(s)`);
  }
  console.log("documents created:", INDEXING.length, "| page links:", links);
  console.log("pages not covered by any document:", pages.length - pageToDoc.size);

  // 3. Re-point extracted values to their document
  const values = await prisma.extractedValue.findMany({
    where: { blobId: BLOB_ID },
    select: { id: true, pageId: true },
  });
  let pointed = 0;
  for (const v of values) {
    const documentId = pageToDoc.get(v.pageId);
    if (documentId) {
      await prisma.extractedValue.update({ where: { id: v.id }, data: { documentId } });
      pointed++;
    }
  }
  console.log("extracted values re-pointed:", pointed, "/", values.length);

  // 4. Re-apply the Missing Document checklist to every document
  const docs = await prisma.document.findMany({
    where: { blobId: BLOB_ID },
    select: { id: true },
  });

  const items = [];
  for (const [name] of MISSING) {
    const text = `Is ${name} Available In Package ?`;
    let item = await prisma.checklistItem.findFirst({ where: { text } });
    if (!item) item = await prisma.checklistItem.create({ data: { text } });
    items.push({ name, item });
  }

  let results = 0;
  for (const doc of docs) {
    for (const [name, category] of MISSING) {
      const item = items.find((i) => i.name === name).item;
      await prisma.documentChecklistResult.upsert({
        where: {
          documentId_checklistItemId: { documentId: doc.id, checklistItemId: item.id },
        },
        create: {
          documentId: doc.id,
          checklistItemId: item.id,
          answer: category === "YES" ? "Yes" : "No",
          flagged: false,
        },
        update: { answer: category === "YES" ? "Yes" : "No" },
      });
      results++;
    }
  }
  console.log("checklist results written:", results, "(", items.length, "questions x", docs.length, "docs )");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
