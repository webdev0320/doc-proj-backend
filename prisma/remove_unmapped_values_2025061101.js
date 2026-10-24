const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOB_ID = 'cmv3y899200013uyg8cyjk586';

// Excel document names with no page range in the indexing table.
const UNMAPPED = [
  "1-4 Family Rider",
  "ACH Authorization Form",
  "Ability To Repay",
  "Acknowledgement Of Fair Market Value",
  "Acknowledgement of Receipt of the Closing Disclosure",
  "Addendum to Closing Disclosure",
  "Addendum to Loan Application",
  "Address Certification",
  "Adjustable Rate Mortgage Disclosure",
  "Advance Fee Agreement",
  "Affidavit Of Affixation",
  "Affiliated Business Disclosure Statement",
  "Anti Coercion Disclosure",
  "Anti-Steering Disclosure",
  "Application Disclosure",
  "Appraisal Acknowledgement",
  "Appraisal Waiver Receipt Form",
  "Borrower Authorization for Counselling",
  "Borrower Debt Certification",
  "Buydown Agreement",
  "CA Per Diem Interest Disclosure",
  "California All-Purpose Acknowledgement",
  "Certificate of Death",
  "Certificate of Eligibility",
  "Check - Bank Checks",
  "Collateral Protection Insurance Disclosure",
  "Condominium Rider",
  "Consumer Explanation Letter",
  "Correction Agreement Limited POA",
  "Data Entry Proof Sheet",
  "Disclosure Notices",
  "Equal Credit Opportunity Act Form",
  "Evidence Of Joint Application",
  "FACT Act Notice To Home Loan Applicant",
  "FHA Appraisal Certificate",
  "FHA Refinance Authorization",
  "Fair Lending Notice",
  "First Lien Letter",
  "Flood Hazard Determination-Flood Certificate",
  "Flood Insurance Disclosure",
  "Form 1040 - Tax Returns",
  "GA Foreclosure Disclosure",
  "HUD 92900-B Important Notice",
  "HUD 92900A-1820A Document",
  "HUD Appraisal Value Disclosure",
  "Hazard and Flood Authorization",
  "Hold Harmless Agreement",
  "Identification Documents",
  "Impound Authorization",
  "Informed Consumer Choice Disclosure Notice",
  "Initial Escrow Account Disclosure Statement",
  "Instructions to Escrow",
  "Lender Instructions",
  "Licensee Information",
  "Mineral Rights Acknowledgement and Agreement",
  "Net Tangible Benefit",
  "No HUD Warranty",
  "Note Addendum",
  "Notice Of No Oral Agreement",
  "Notice of Furnishing Negative Information",
  "Notice to Homeowner",
  "Notice to Purchasers",
  "Planned Unit Development Rider",
  "Power Of Attorney",
  "Rate Lock Agreement",
  "Recorded Subordination Agreement",
  "Report And Certificate Of Loan Disbursemt -VA 26-1820",
  "Right To Select An Attorney",
  "SSA Form 89 Verification Report",
  "Second Home Rider",
  "Settlement Statement",
  "Tax Authorization",
  "Tax Certificate",
  "Taxpayer Consent Form",
  "Texas Home Equity Affidavit And Agreement First Lien Disclosure",
  "Title Commitment",
  "Trust Agreement",
  "Trust Certification",
  "UCC1 Statement",
  "VA 26-0503 Federal Collection",
  "VA 26-0592 Military Checklist",
  "Wire Transfer Disbursement Detail",
  "Wisconsin Property Tax Escrow Option"
];

async function main() {
  const before = await prisma.extractedValue.count({ where: { blobId: BLOB_ID } });

  const deleted = await prisma.extractedValue.deleteMany({
    where: { blobId: BLOB_ID, documentName: { in: UNMAPPED } },
  });

  const after = await prisma.extractedValue.count({ where: { blobId: BLOB_ID } });

  console.log('before:', before);
  console.log('deleted (unmapped docs):', deleted.count);
  console.log('after:', after);

  const byDoc = await prisma.extractedValue.groupBy({
    by: ['documentName'],
    where: { blobId: BLOB_ID },
    _count: { _all: true },
  });
  console.log('remaining documentNames:', byDoc.length);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
