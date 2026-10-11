const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOB_ID = 'cmv3y899200013uyg8cyjk586';

const rows = [
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Borrower Name", extractedValue: "Kevin Bevacqua" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Loan Amount", extractedValue: "35000" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Closing Date", extractedValue: "03/22/2025" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Street Address", extractedValue: "15 woodsend Rd" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "City", extractedValue: "Middletown" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "State", extractedValue: "NJ" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Zip Code", extractedValue: "7748" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Interest Rate", extractedValue: "8.5" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Closing Disclosure is Present ?", extractedValue: "YES" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Number of Pages", extractedValue: "5" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Borrower Signature", extractedValue: "YES" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Co-Borrower Present", extractedValue: "NO" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Co-Borrower Signature", extractedValue: "NO" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender Name", extractedValue: "AmeriSave Mortgage Corporation" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender Address", extractedValue: "1200 Altmore Ave, Building 2 Suite 300, Sandy Springs GA 30342" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender NMLS", extractedValue: "1168" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender State License", extractedValue: "9943847" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender Contact", extractedValue: "Gavin Dre Gardner" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender Contact Email", extractedValue: "ggardner@amerisave.com" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Lender Contact Phone", extractedValue: "8669707283" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Name", extractedValue: "20/20 Settlement Services LLC" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Address", extractedValue: "333 Technology Drive, Suite 112, Cannonsburg, PA 15317" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent ST License ID", extractedValue: "3001043738" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Contact", extractedValue: "Kandi A Jablonski" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Contact ST License ID", extractedValue: "1039128" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Email", extractedValue: "closing@2020title.com" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Settlement Agent Phone", extractedValue: "8445702020" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Loan Number", extractedValue: "22633579" },
  { pageId: "cmv3yj7k700383uygp9m288h9", documentId: "cmv3yj7n7008v3uyg7ob1juoe", documentName: "CLOSING_DISCLOSURE", fieldName: "Loan Type", extractedValue: "Conventional" },
  { pageId: "cmv3yj7k7002p3uygmh2c5bw5", documentId: "cmv3yj7n0008h3uyg5j02o587", documentName: "TITLE_COMMITMENT", fieldName: "Title Commitment Document is Present ?", extractedValue: "NO" },
  { pageId: "cmv3yj7k7002z3uyghy8h4bmr", documentId: "cmv3yj7n2008l3uygkaftsbpr", documentName: "FIRST_PAYMENT_LETTER", fieldName: "First Payment Letter is Present ?", extractedValue: "YES" },
  { pageId: "cmv3yj7k7002z3uyghy8h4bmr", documentId: "cmv3yj7n2008l3uygkaftsbpr", documentName: "FIRST_PAYMENT_LETTER", fieldName: "Borrower Signature", extractedValue: "YES" },
  { pageId: "cmv3yj7k7002z3uyghy8h4bmr", documentId: "cmv3yj7n2008l3uygkaftsbpr", documentName: "FIRST_PAYMENT_LETTER", fieldName: "Borrower Signed Date", extractedValue: "03/22/2025" },
  { pageId: "cmv3yj7k7002z3uyghy8h4bmr", documentId: "cmv3yj7n2008l3uygkaftsbpr", documentName: "FIRST_PAYMENT_LETTER", fieldName: "Co-Borrower Present", extractedValue: "NO" },
  { pageId: "cmv3yj7k7002z3uyghy8h4bmr", documentId: "cmv3yj7n2008l3uygkaftsbpr", documentName: "FIRST_PAYMENT_LETTER", fieldName: "Co-Borrower Signature", extractedValue: "NO" },
  { pageId: "cmv3yj7k700363uygpjg9knnq", documentId: "cmv3yj7n5008r3uygrdm7q30d", documentName: "POWER_OF_ATTORNEY", fieldName: "Power Of Attorney is Present ?", extractedValue: "NO" },
];

async function main() {
  const deleted = await prisma.extractedValue.deleteMany({
    where: { blobId: BLOB_ID },
  });
  console.log('Deleted ' + deleted.count + ' existing rows for blob ' + BLOB_ID);

  const created = await prisma.extractedValue.createMany({
    data: rows.map(r => ({ ...r, blobId: BLOB_ID })),
    skipDuplicates: true,
  });
  console.log('Inserted ' + created.count + ' extracted values');

  const byDoc = await prisma.extractedValue.groupBy({
    by: ['documentName'],
    where: { blobId: BLOB_ID },
    _count: { _all: true },
  });
  byDoc.forEach(function (d) {
    console.log('  ' + d.documentName + ': ' + d._count._all);
  });

  const count = await prisma.extractedValue.count({ where: { blobId: BLOB_ID } });
  console.log('Total rows for blob: ' + count);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
