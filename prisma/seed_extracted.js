const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOB_ID = 'cmt45c5iy0001i7yxrk5bznsd';

const rows = [
  // 1003 Loan Application
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Agency Case Number', extractedValue: '49-49-6-1715503' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Borrower Citizenship', extractedValue: 'U.S. Citizen' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Borrower Date of Birth', extractedValue: '7/13/1986' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Borrower Marital Status', extractedValue: 'Married' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Borrower Name', extractedValue: 'Roy N Towers' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Borrower Social Security Number', extractedValue: '457-79-7739' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Co-Borrower Citizenship', extractedValue: 'U.S. Citizen' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Co-Borrower Date of Birth', extractedValue: '3/11/1996' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Co-Borrower Marital Status', extractedValue: 'Married' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Co-Borrower Name', extractedValue: 'Maile S Towers' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Co-Borrower Social Security Number', extractedValue: '540-49-2260' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Credit Type', extractedValue: 'I am applying for joint credit' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Loan Amount', extractedValue: '399,999.00' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Loan Number', extractedValue: '400195694' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Number of Borrowers', extractedValue: '2' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Number of Units', extractedValue: '1' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Occupancy Type', extractedValue: 'Primary Residence' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Property City', extractedValue: 'Stephenville' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Property State', extractedValue: 'TX' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Property Street Address', extractedValue: '2192 FM 205' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Property Type', extractedValue: 'Property is not located in a Project' },
  { pageId: 'cmt45f9ft001gi7yxsysw74f9', documentName: '1003 Loan Application', fieldName: 'Property Zip Code', extractedValue: '76401' },
  // Appraisal
  { pageId: 'cmt45f9ft0007i7yxoupw09fb', documentName: 'Appraisal', fieldName: 'Property Origination Appraisal Date', extractedValue: '5/8/2025' },
  { pageId: 'cmt45f9ft0007i7yxoupw09fb', documentName: 'Appraisal', fieldName: 'Property Origination Appraisal Value', extractedValue: '410,000' },
  // AUS Finding
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Amortization Type', extractedValue: 'Fixed Rate' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Annual MI Premium', extractedValue: '0' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Interest Rate', extractedValue: '6.75' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Loan Term - Months', extractedValue: '360' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'LP Result - DU Result', extractedValue: 'Approve/Eligible' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Monthly PI', extractedValue: '2594.39' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'Sales Price', extractedValue: '399999' },
  { pageId: 'cmt45f9fv0063i7yx79wt599p', documentName: 'AUS Finding', fieldName: 'SFHA Zone', extractedValue: 'No' },
  // Closing Disclosure
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Borrower Name', extractedValue: 'Roy N Towers' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Borrower Signature', extractedValue: 'Yes' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Borrower Signature Date', extractedValue: '5/19/2025' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Case Number', extractedValue: '49-49-6-1715503' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Closing Date', extractedValue: '5/23/2025' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Co-Borrower Name', extractedValue: 'Maile S Towers' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Co-Borrower Signature', extractedValue: 'Yes' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Co-Borrower Signature Date', extractedValue: '5/19/2025' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Interest Rate', extractedValue: '6.75' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Loan Amount', extractedValue: '399,999' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Loan Number', extractedValue: '400195694' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Loan Type', extractedValue: 'VA' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Property City', extractedValue: 'Stephenville' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Property State', extractedValue: 'TX' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Property Street Address', extractedValue: '2192 FM 205' },
  { pageId: 'cmt45f9ft000bi7yx1prtpee9', documentName: 'Closing Disclosure', fieldName: 'Property Zip Code', extractedValue: '76401' },
  // Flood Certificate
  { pageId: 'cmt45f9ft000ai7yxpkzll0ku', documentName: 'Flood Certificate', fieldName: 'Flood Certificate Date', extractedValue: '5/2/2025' },
  { pageId: 'cmt45f9ft000ai7yxpkzll0ku', documentName: 'Flood Certificate', fieldName: 'Flood Certificate Number', extractedValue: '2505050240' },
  { pageId: 'cmt45f9ft000ai7yxpkzll0ku', documentName: 'Flood Certificate', fieldName: 'Flood Zone', extractedValue: 'X' },
  // Note
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Borrower Name', extractedValue: 'ROY N TOWERS' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Case Number', extractedValue: '49-49-6-1715503' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Closing Date', extractedValue: '5/27/2025' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'First Payment Date', extractedValue: '7/1/2025' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Interest Rate', extractedValue: '6.75' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Loan Amount', extractedValue: '399,999.00' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Original Maturity Date', extractedValue: '6/1/2055' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'P and I Amount', extractedValue: '2,594.39' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Property City', extractedValue: 'Stephenville' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Property State', extractedValue: 'TX' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Property Street Address', extractedValue: '2192 FM 205' },
  { pageId: 'cmt45f9ft000mi7yxhtuh8r0r', documentName: 'Note', fieldName: 'Property Zip Code', extractedValue: '76401' },
];

async function main() {
  // First, delete any existing rows for this blob (in case the user manually inserted some with wrong pageIds)
  const deleted = await prisma.extractedValue.deleteMany({
    where: { blobId: BLOB_ID },
  });
  console.log(`Deleted ${deleted.count} existing rows for blob ${BLOB_ID}`);

  // Insert all rows
  const created = await prisma.extractedValue.createMany({
    data: rows.map(r => ({ ...r, blobId: BLOB_ID })),
    skipDuplicates: true,
  });
  console.log(`Inserted ${created.count} extracted values`);

  // Verify
  const count = await prisma.extractedValue.count({
    where: { blobId: BLOB_ID },
  });
  console.log(`Total rows for blob: ${count}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
