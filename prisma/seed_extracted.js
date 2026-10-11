const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BLOB_ID = 'cmtq1omrs0001ikvcg0ve11wr';

const rows = [
  // Paystub - Borrower (pageId: cmtq1tkh80005ikvcct6iwjuu, pageIndex: 2)
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Account Number', extractedValue: 'XXXXXX1010' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Business Phone', extractedValue: '8586720732' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Check Amount', extractedValue: '481.08' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Company Address Line 2', extractedValue: '14391 Penasquitos Drive San Diego, CA 92129' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Company Code', extractedValue: 'K8/K22 25078535' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Company Name', extractedValue: 'Mojtehedi Inc' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Employee Location', extractedValue: '13577 Paseo Cardiel San Diego, CA 92129' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Overtime 1', extractedValue: '478.5' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Overtime 2', extractedValue: '152.25' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Pay Date', extractedValue: '2021-01-07 00:00:00' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Pay Rate', extractedValue: '14.5' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Period End Date', extractedValue: '24/06/2021' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Period start date', extractedValue: '18/06/2021' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Regular Earnings 1', extractedValue: '580' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Regular Earnings 2', extractedValue: '464' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Social Security Number', extractedValue: 'XXX-XX-7920' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Taxes Total', extractedValue: '580' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'Transcation Number', extractedValue: 'XXXXXXXXXX' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'YTD Regular 1', extractedValue: '4071.6' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'YTD Regular 2', extractedValue: '957' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'YTD Total', extractedValue: '4550.1' },
  { pageId: 'cmtq1tkh80005ikvcct6iwjuu', documentName: 'Paystub - Borrower', fieldName: 'YTD Total Deductions', extractedValue: '546.1' },

  // Paystub - Co-Borrower (pageId: cmtq1tkh80003ikvcs3w1zsvg, pageIndex: 0)
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Account Number', extractedValue: 'XXXXXXXX9151' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Check Amount', extractedValue: '4390-75' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Company Address Line 2', extractedValue: '640 N. McCarthy Blvd. Milpitas, CA 95035' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Company Code', extractedValue: 'CYPR' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Company Name', extractedValue: 'Cypress Semiconductor Corp' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Earnings Bonus', extractedValue: '4265.63' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Employee ID', extractedValue: '847332' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Employee Location', extractedValue: '10977 AVENIDA MA SAN DIEGO, CA 92129' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Hire Date', extractedValue: '2018-11-06 00:00:00' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Pay Date', extractedValue: '2021-02-07 00:00:00' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Period End Date', extractedValue: '27/06/2021' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Period start date', extractedValue: '14/06/2021' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Regular Earnings 1', extractedValue: '5376.46' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'Taxes Total', extractedValue: '10217.36' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'YTD Holiday', extractedValue: '1587.65' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'YTD Regular 1', extractedValue: '67561.75' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'YTD Retro, PTO Pay', extractedValue: '34.66' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'YTD Total', extractedValue: '82651.7' },
  { pageId: 'cmtq1tkh80003ikvcs3w1zsvg', documentName: 'Paystub - Co-Borrower', fieldName: 'YTD Total Deductions', extractedValue: '7588.82' },

  // W2 Form 2019 -1 - Borrower (pageId: cmtq1tkh8000mikvcowoj4xj0, pageIndex: 19)
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employe Name', extractedValue: 'YIEN S LIN' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employee Address', extractedValue: '10977 AVENIDA MA SAN DIEGO, CA 92129' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employee SSN', extractedValue: '617-23-7920' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employer Address Line 1', extractedValue: '14391 PENASQUITOS DRIVE SAN DIEGO, CA 92129' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employer Name', extractedValue: 'MOJTEHEDI INC' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employers Identification Number', extractedValue: '01-0960760' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Employers State ID Number', extractedValue: '083-9598 0' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Federal income tax withheld', extractedValue: '1541.18' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Medicare Tax withheld', extractedValue: '303.31' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Medicare Wages and Tips', extractedValue: '20917.63' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Social security tax withheld', extractedValue: '1296.89' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Social security wages', extractedValue: '20917.63' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'State', extractedValue: 'CA' },
  { pageId: 'cmtq1tkh8000mikvcowoj4xj0', documentName: 'W2 Form 2019 -1 - Borrower', fieldName: 'Wages, tips, other comp.', extractedValue: '20917.63' },

  // W2 Form 2019 -2 - Borrower (pageId: cmtq1tkh8000oikvcy7ivmvmi, pageIndex: 21)
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Employe Name', extractedValue: 'YIEN S LIN' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Employee Address', extractedValue: '10977 AVENIDA MA SAN DIEGO, CA 92129' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Employee SSN', extractedValue: '617-23-7920' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Employers Identification Number', extractedValue: '01-0960760' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Employers State ID Number', extractedValue: '330-0183 5' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Federal income tax withheld', extractedValue: '99.99' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Medicare Tax withheld', extractedValue: '12.87' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Medicare Wages and Tips', extractedValue: '887.5' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Social security tax withheld', extractedValue: '55.03' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Social security wages', extractedValue: '887.5' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'State', extractedValue: 'CA' },
  { pageId: 'cmtq1tkh8000oikvcy7ivmvmi', documentName: 'W2 Form 2019 -2 - Borrower', fieldName: 'Wages, tips, other comp.', extractedValue: '887.5' },

  // W2 Form 2020 - Co-Borrower (pageId: cmtq1tkh8000jikvc4fw29k8h, pageIndex: 16)
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employe Name', extractedValue: 'YEN-AN LIN' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employee Address', extractedValue: '10977 AVENIDA MA SAN DIEGO, CA 92129' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employee SSN', extractedValue: 'XXX-XX-8644' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employer Address Line 1', extractedValue: '5204 E BEN WHITE BLVD AUSTIN, TX 78741' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employer Name', extractedValue: 'CYPRESS SEMICONDUCTOR ' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employers Identification Number', extractedValue: '94-2885898' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Employers State ID Number', extractedValue: '305-1478 0' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Federal income tax withheld', extractedValue: '9009.73' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Medicare Tax withheld', extractedValue: '2479.32' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Medicare Wages and Tips', extractedValue: '171029.24' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Social security tax withheld', extractedValue: '8537.4' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Social security wages', extractedValue: '137700' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'State', extractedValue: 'CA' },
  { pageId: 'cmtq1tkh8000jikvc4fw29k8h', documentName: 'W2 Form 2020 - Co-Borrower', fieldName: 'Wages, tips, other comp.', extractedValue: '165294.96' },
];

async function main() {
  const deleted = await prisma.extractedValue.deleteMany({
    where: { blobId: BLOB_ID },
  });
  console.log(`Deleted ${deleted.count} existing rows for blob ${BLOB_ID}`);

  const created = await prisma.extractedValue.createMany({
    data: rows.map(r => ({ ...r, blobId: BLOB_ID })),
    skipDuplicates: true,
  });
  console.log(`Inserted ${created.count} extracted values`);

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
