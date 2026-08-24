require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DOCUMENT_ID = 'cmt45f9i0009qi7yx9bl7xza5';

// The extracted values to insert — grouped by document name
const EXTRACTED_DATA = {
  'HUD1_CLOSING_DISCLOSURE_ORIGINAL_LOAN_FILE': {
    'Borrower Name': 'Roy N Towers',
    'Borrower Signature': 'Yes',
    'Borrower Signature Date': '5/19/2025',
    'Case Number': '49-49-6-1715503',
    'Closing Date': '5/23/2025',
    'Co-Borrower Name': 'Maile S Towers',
    'Co-Borrower Signature': 'Yes',
    'Co-Borrower Signature Date': '5/19/2025',
    'Interest Rate': '6.75',
    'Loan Amount': '399,999',
    'Loan Number': '400195694',
    'Loan Type': 'VA',
    'Property City': 'Stephenville',
    'Property State': 'TX',
    'Property Street Address': '2192 FM 205',
    'Property Zip Code': '76401',
  },
};

async function main() {
  console.log('=== DIAGNOSTIC: Checking document and page IDs ===\n');

  // 1. Find the document
  const doc = await prisma.document.findUnique({
    where: { id: DOCUMENT_ID },
    select: { id: true, documentType: true, name: true, blobId: true },
  });
  if (!doc) {
    console.error(`Document ${DOCUMENT_ID} not found!`);
    await prisma.$disconnect();
    return;
  }
  console.log(`Document: ${doc.name} (${doc.documentType})`);
  console.log(`Blob ID: ${doc.blobId}\n`);

  // 2. Get all pageIds for this document
  const docPages = await prisma.documentPage.findMany({
    where: { documentId: DOCUMENT_ID },
    select: { pageId: true, order: true },
    orderBy: { order: 'asc' },
  });
  console.log(`Pages in document: ${docPages.length}`);
  docPages.forEach(dp => console.log(`  pageId: ${dp.pageId} (order: ${dp.order})`));

  const pageIds = docPages.map(dp => dp.pageId);

  // 3. Check existing extracted values
  const existing = await prisma.extractedValue.findMany({
    where: { pageId: { in: pageIds } },
    select: { pageId: true, fieldName: true, extractedValue: true },
  });
  console.log(`\nExisting extracted_values for these pages: ${existing.length}`);
  if (existing.length > 0) {
    existing.forEach(e => console.log(`  ${e.pageId} -> ${e.fieldName}: ${e.extractedValue}`));
  }

  // 4. Also check ALL extracted_values for this blob
  const allBlobValues = await prisma.extractedValue.findMany({
    where: { blobId: doc.blobId },
    select: { pageId: true, documentName: true, fieldName: true },
  });
  console.log(`\nAll extracted_values for blob ${doc.blobId}: ${allBlobValues.length}`);
  if (allBlobValues.length > 0) {
    allBlobValues.forEach(e => console.log(`  pageId=${e.pageId} doc=${e.documentName} field=${e.fieldName}`));
  }

  // 5. Check what pageIds exist in the pages table for this blob
  const blobPages = await prisma.page.findMany({
    where: { blobId: doc.blobId },
    select: { id: true, pageIndex: true, aiLabel: true },
    orderBy: { pageIndex: 'asc' },
    take: 10,
  });
  console.log(`\nFirst 10 pages in blob (of ${await prisma.page.count({ where: { blobId: doc.blobId } })} total):`);
  blobPages.forEach(p => console.log(`  id=${p.id} pageIndex=${p.pageIndex} aiLabel=${p.aiLabel}`));

  // 6. Now insert extracted values on the first page of the document
  if (pageIds.length === 0) {
    console.error('\nNo pages found for this document — cannot insert extracted values.');
    await prisma.$disconnect();
    return;
  }

  const targetPageId = pageIds[0]; // Use the first page
  const docType = doc.documentType || 'UNKNOWN';

  console.log(`\n=== INSERTING extracted values on pageId: ${targetPageId} ===`);
  console.log(`Document name: ${docType}`);

  const values = EXTRACTED_DATA[docType] || EXTRACTED_DATA['HUD1_CLOSING_DISCLOSURE_ORIGINAL_LOAN_FILE'];

  // Delete existing for this page first
  const deleted = await prisma.extractedValue.deleteMany({
    where: { pageId: targetPageId },
  });
  console.log(`Deleted ${deleted.count} existing rows for page ${targetPageId}`);

  // Insert new rows
  const rows = Object.entries(values).map(([fieldName, extractedValue]) => ({
    blobId: doc.blobId,
    pageId: targetPageId,
    documentName: docType,
    fieldName,
    extractedValue,
  }));

  const created = await prisma.extractedValue.createMany({
    data: rows,
    skipDuplicates: true,
  });
  console.log(`Inserted ${created.count} extracted values`);

  // Verify
  const verify = await prisma.extractedValue.findMany({
    where: { pageId: targetPageId },
    select: { fieldName: true, extractedValue: true },
  });
  console.log(`\nVerification — rows for page ${targetPageId}: ${verify.length}`);
  verify.forEach(v => console.log(`  ${v.fieldName}: ${v.extractedValue}`));

  await prisma.$disconnect();
  console.log('\nDone.');
}

main().catch(e => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
