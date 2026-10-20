const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BLOB_ID = "cmv3y899200013uyg8cyjk586";

// [aiLabel, pageFrom, pageTo] -- page numbers are 1-based PDF pages
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

async function main() {
  const blob = await prisma.blob.findUnique({
    where: { id: BLOB_ID },
    select: { id: true, pageCount: true },
  });
  if (!blob) {
    console.error("Blob not found: " + BLOB_ID);
    process.exit(1);
  }
  console.log("blob found, pageCount =", blob.pageCount);

  let total = 0;
  for (const [label, from, to] of INDEXING) {
    const result = await prisma.page.updateMany({
      where: {
        blobId: BLOB_ID,
        pageIndex: { gte: from - 1, lte: to - 1 },
      },
      data: { aiLabel: label },
    });
    console.log(
      "  p" +
        from +
        "-" +
        to +
        "  idx " +
        (from - 1) +
        "-" +
        (to - 1) +
        "  " +
        label +
        "  -> " +
        result.count +
        " page(s)"
    );
    total += result.count;
  }
  console.log("total pages updated:", total);

  const leftover = await prisma.page.findMany({
    where: { blobId: BLOB_ID, aiLabel: null },
    select: { pageIndex: true },
    orderBy: { pageIndex: "asc" },
  });
  console.log("pages still with null aiLabel:", leftover.length);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
