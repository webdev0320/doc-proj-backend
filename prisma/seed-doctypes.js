const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const types = [
    // ── ASSETS ──
    { code: 'ASSET_401K', label: 'Assets: 401(k) Statement', description: 'Retirement account balance and holdings summary.', isCommon: true },
    { code: 'ASSET_BANK', label: 'Assets: Bank Statement', description: 'Checking/savings account transaction history.', isCommon: true },
    { code: 'ASSET_CHECKING', label: 'Assets: Checking Account Statement', description: 'Monthly checking account activity.', isCommon: true },
    { code: 'ASSET_SAVINGS', label: 'Assets: Savings Account Statement', description: 'Savings account balance and interest earned.', isCommon: true },
    { code: 'ASSET_CD', label: 'Assets: Certificate of Deposit (CD)', description: 'Time deposit account statement.', isCommon: false },
    { code: 'ASSET_MONEY_MARKET', label: 'Assets: Money Market Account', description: 'Money market fund statement.', isCommon: false },
    { code: 'ASSET_STOCKS', label: 'Assets: Stock/Brokerage Statement', description: 'Securities and investment holdings.', isCommon: true },
    { code: 'ASSET_BONDS', label: 'Assets: Bond Statement', description: 'Bond portfolio holdings.', isCommon: false },
    { code: 'ASSET_MUTUAL_FUND', label: 'Assets: Mutual Fund Statement', description: 'Mutual fund account summary.', isCommon: false },
    { code: 'ASSET_RETIREMENT', label: 'Assets: Retirement Account (IRA/ROTH)', description: 'Individual retirement account statement.', isCommon: true },
    { code: 'ASSET_PENSION', label: 'Assets: Pension Statement', description: 'Employer pension benefit statement.', isCommon: false },
    { code: 'ASSET_CASH_DOWN', label: 'Assets: Cash Down Payment', description: 'Verification of funds for down payment.', isCommon: true },
    { code: 'ASSET_GIFT_FUNDS', label: 'Assets: Gift Funds Documentation', description: 'Gift letter and transfer proof.', isCommon: true },
    { code: 'ASSET_VECHICLE', label: 'Assets: Vehicle Title/Registration', description: 'Automobile or recreational vehicle ownership.', isCommon: false },
    { code: 'ASSET_REAL_ESTATE', label: 'Assets: Other Real Estate (OREO)', description: 'Ownership of additional properties.', isCommon: true },
    { code: 'ASSET_LIFE_INSURANCE', label: 'Assets: Cash Value Life Insurance', description: 'Whole/universal life insurance cash value.', isCommon: false },
    { code: 'ASSET_EMPLOYMENT_STK', label: 'Assets: Employee Stock Ownership', description: 'ESOP or restricted stock units.', isCommon: false },
    { code: 'ASSET_CRYPTO', label: 'Assets: Cryptocurrency Holdings', description: 'Digital asset exchange statements.', isCommon: false },
    { code: 'ASSET_BUSINESS_INT', label: 'Assets: Business Interest/Ownership', description: 'Ownership stake documentation.', isCommon: false },
    { code: 'ASSET_TRUST', label: 'Assets: Trust Account Statement', description: 'Revocable/irrevocable trust funds.', isCommon: false },
    { code: 'ASSET_529', label: 'Assets: 529 Education Savings', description: 'Education savings plan statement.', isCommon: false },
    { code: 'ASSET_HSA', label: 'Assets: Health Savings Account (HSA)', description: 'HSA balance and contributions.', isCommon: false },

    // ── LIABILITIES ──
    { code: 'LIAB_CREDIT_CARD', label: 'Liabilities: Credit Card Statement', description: 'Monthly credit card balance and payments.', isCommon: true },
    { code: 'LIAB_AUTO_LOAN', label: 'Liabilities: Auto Loan Statement', description: 'Vehicle financing balance.', isCommon: true },
    { code: 'LIAB_STUDENT_LOAN', label: 'Liabilities: Student Loan Statement', description: 'Federal or private student loan balance.', isCommon: true },
    { code: 'LIAB_PERSONAL_LOAN', label: 'Liabilities: Personal Loan Statement', description: 'Unsecured personal loan balance.', isCommon: true },
    { code: 'LIAB_HELOAN', label: 'Liabilities: HELOC Statement', description: 'Home equity line of credit balance.', isCommon: true },
    { code: 'LIAB_HOME_EQUITY', label: 'Liabilities: Home Equity Loan', description: 'Second mortgage or equity loan.', isCommon: true },
    { code: 'LIAB_MORTGAGE', label: 'Liabilities: Mortgage Statement', description: 'Current mortgage payment and balance.', isCommon: true },
    { code: 'LIAB_JUDGMENT', label: 'Liabilities: Judgment/Lien', description: 'Court-ordered debt or tax lien.', isCommon: false },
    { code: 'LIAB_CHILD_SUPPORT', label: 'Liabilities: Child Support Obligation', description: 'Court-ordered support payments.', isCommon: false },
    { code: 'LIAB_ALIMONY', label: 'Liabilities: Alimony/Separation', description: 'Court-ordered spousal support.', isCommon: false },
    { code: 'LIAB_BUSINESS_DEBT', label: 'Liabilities: Business Debt', description: 'Business loan or line of credit.', isCommon: false },
    { code: 'LIAB_MARGIN_LOAN', label: 'Liabilities: Margin Loan', description: 'Securities-backed line of credit.', isCommon: false },
    { code: 'LIAB_CO-signer', label: 'Liabilities: Co-Signed Loan', description: 'Liability as guarantor on another loan.', isCommon: false },
    { code: 'LIAB_INSTALLMENT', label: 'Liabilities: Installment Contract', description: 'Time payment purchase agreements.', isCommon: false },

    // ── INCOME ──
    { code: 'INC_W2', label: 'Income: W-2 Wage & Tax Statement', description: 'Annual wages and withholdings.', isCommon: true },
    { code: 'INC_PAYSTUB', label: 'Income: Paystub (Current)', description: 'Most recent 30-day earnings.', isCommon: true },
    { code: 'INC_PAYSTUB_YTD', label: 'Income: Paystub (Year-to-Date)', description: 'YTD earnings summary.', isCommon: true },
    { code: 'INC_TAX_1040', label: 'Income: IRS Form 1040', description: 'Individual income tax return.', isCommon: true },
    { code: 'INC_TAX_1040_SCH_C', label: 'Income: 1040 Schedule C', description: 'Profit or loss from business (self-employed).', isCommon: true },
    { code: 'INC_TAX_1040_SCH_E', label: 'Income: 1040 Schedule E', description: 'Supplemental income from rentals/partnerships.', isCommon: true },
    { code: 'INC_TAX_1040_SCH_F', label: 'Income: 1040 Schedule F', description: 'Profit or loss from farming.', isCommon: false },
    { code: 'INC_1099_INT', label: 'Income: 1099-INT', description: 'Interest income statement.', isCommon: true },
    { code: 'INC_1099_DIV', label: 'Income: 1099-DIV', description: 'Dividends and distributions.', isCommon: true },
    { code: 'INC_1099_MISC', label: 'Income: 1099-MISC', description: 'Miscellaneous non-employee income.', isCommon: true },
    { code: 'INC_1099_NEC', label: 'Income: 1099-NEC', description: 'Non-employee compensation.', isCommon: true },
    { code: 'INC_1099_SS', label: 'Income: 1099-SSA', description: 'Social Security benefit statement.', isCommon: true },
    { code: 'INC_1099_R', label: 'Income: 1099-R', description: 'Pension and annuity distributions.', isCommon: true },
    { code: 'INC_K1', label: 'Income: Schedule K-1', description: 'Partnership/S-corp/trust income share.', isCommon: true },
    { code: 'INC_PENSION', label: 'Income: Pension/Annuity Statement', description: 'Retirement income documentation.', isCommon: true },
    { code: 'INC_SOCIAL_SEC', label: 'Income: Social Security Award Letter', description: 'SS benefit verification.', isCommon: true },
    { code: 'INC_DISABILITY', label: 'Income: Disability Award Letter', description: 'Disability income verification.', isCommon: false },
    { code: 'INC_VA_COMP', label: 'Income: VA Compensation', description: 'Veterans Affairs disability/compensation.', isCommon: false },
    { code: 'INC_UNEMPLOYMENT', label: 'Income: Unemployment Benefits', description: 'State unemployment income.', isCommon: false },
    { code: 'INC_ALIMONY', label: 'Income: Alimony/Spousal Support', description: 'Court-ordered income from support.', isCommon: false },
    { code: 'INC_CHILD_SUPPORT', label: 'Income: Child Support Received', description: 'Court-ordered support income.', isCommon: false },
    { code: 'INC_RENTAL', label: 'Income: Rental Income Schedule', description: 'Rental property income/expense.', isCommon: true },
    { code: 'INC_TRUST', label: 'Income: Trust Distribution', description: 'Income from trust disbursements.', isCommon: false },
    { code: 'INC_FOREIGN', label: 'Income: Foreign Income Documentation', description: 'Overseas employment income.', isCommon: false },
    { code: 'INC_MILITARY', label: 'Income: Military LES (Leave Earnings)', description: 'Military leave and earnings statement.', isCommon: false },

    // ── PROPERTY ──
    { code: 'PROP_1003', label: 'Property: Uniform Residential Loan App', description: 'Form 1003 - primary loan application.', isCommon: true },
    { code: 'PROP_PURCHASE', label: 'Property: Purchase Agreement', description: 'Executed sales contract.', isCommon: true },
    { code: 'PROP_ADDENDUM', label: 'Property: Purchase Addendum', description: 'Contract amendments/extensions.', isCommon: true },
    { code: 'PROP_APPRAISAL', label: 'Property: Appraisal Report', description: 'Form 1004 - property valuation.', isCommon: true },
    { code: 'PROP_APPRAISAL_WAIVER', label: 'Property: Appraisal Waiver', description: 'Automated valuation waiver notice.', isCommon: true },
    { code: 'PROP_ORED', label: 'Property: ORED/Trid Closing Disclosure', description: 'Closing Disclosure (CD) document.', isCommon: true },
    { code: 'PROP_LE', label: 'Property: Loan Estimate (LE)', description: 'Initial loan cost estimate.', isCommon: true },
    { code: 'PROP_TITLE_COMMIT', label: 'Property: Title Commitment', description: 'Preliminary title report.', isCommon: true },
    { code: 'PROP_TITLE_INSURANCE', label: 'Property: Title Insurance Policy', description: 'Lender or owner title coverage.', isCommon: true },
    { code: 'PROP_DEED', label: 'Property: Deed of Trust/Mortgage', description: 'Security instrument document.', isCommon: true },
    { code: 'PROP_HUD1', label: 'Property: HUD-1 Settlement Stmt', description: 'Settlement cost statement.', isCommon: true },
    { code: 'PROP_CLOSING', label: 'Property: Closing Statement', description: 'Final settlement figures.', isCommon: true },
    { code: 'PROP_PQA', label: 'Property: Property Questionnaire App', description: 'Borrower property questionnaire.', isCommon: false },
    { code: 'PROP_SURVEY', label: 'Property: Survey/Plot Plan', description: 'Property boundary survey.', isCommon: false },
    { code: 'PROP_PDD', label: 'Property: Property Data Document', description: 'Detailed property description.', isCommon: false },
    { code: 'PROP_FLOOD_CERT', label: 'Property: Flood Certification', description: 'FEMA flood zone determination.', isCommon: true },
    { code: 'PROP_HAZARD_Zoning', label: 'Property: Hazard/Zoning Report', description: 'Environmental and zoning compliance.', isCommon: false },
    { code: 'PROP_PEST', label: 'Property: Termite/Pest Inspection', description: 'Wood-destroying insect report.', isCommon: false },
    { code: 'PROP_ROOF', label: 'Property: Roof Inspection Report', description: 'Roof condition assessment.', isCommon: false },
    { code: 'PROP_SEPTIC', label: 'Property: Septic Inspection', description: 'On-site sewage system report.', isCommon: false },
    { code: 'PROP_WELL', label: 'Property: Well Water Test', description: 'Potable water quality report.', isCommon: false },
    { code: 'PROP_HOA', label: 'Property: HOA Document/Packet', description: 'Homeowners association documents.', isCommon: true },
    { code: 'PROP_HOA_DUES', label: 'Property: HOA Dues Statement', description: 'Association fee payment history.', isCommon: true },
    { code: 'PROP_CONDO_DOCS', label: 'Property: Condo Questionnaire', description: 'Condo project documentation.', isCommon: true },
    { code: 'PROP_COOP_DOCS', label: 'Property: Co-op Building Docs', description: 'Cooperative building financials.', isCommon: false },
    { code: 'PROP_MFR_DOCS', label: 'Property: Multi-Family 2-4 Unit Docs', description: 'Multi-family property documentation.', isCommon: false },

    // ── INSURANCE ──
    { code: 'INS_HOI', label: 'Insurance: Homeowners (HOI) Dec Page', description: 'HO-3/HO-5 declaration summary.', isCommon: true },
    { code: 'INS_FLOOD', label: 'Insurance: Flood Insurance', description: 'NFIP or private flood policy.', isCommon: true },
    { code: 'INS_WIND', label: 'Insurance: Windstorm Policy', description: 'Coastal wind/hail coverage.', isCommon: false },
    { code: 'INS_EQUIPMENT', label: 'Insurance: Equipment Breakdown', description: 'Mechanical/electrical breakdown.', isCommon: false },
    { code: 'INS_MORTGAGE_INS', label: 'Insurance: Mortgage Insurance (PMI)', description: 'Private mortgage insurance cert.', isCommon: true },
    { code: 'INS_TITLE_INS', label: 'Insurance: Title Insurance Binder', description: 'Title coverage commitment.', isCommon: true },
    { code: 'INS_PROPERTIES_INS', label: 'Insurance: Hazard Insurance', description: 'Property casualty coverage.', isCommon: true },
    { code: 'INS_LIABILITY', label: 'Insurance: Liability/Umbrella Policy', description: 'Additional liability coverage.', isCommon: false },

    // ── LEGAL ──
    { code: 'LEGAL_ID_DL', label: "Legal: Driver's License", description: "State-issued photo identification.", isCommon: true },
    { code: 'LEGAL_ID_PASSPORT', label: 'Legal: US Passport', description: 'Passport identification page.', isCommon: true },
    { code: 'LEGAL_ID_SSN', label: 'Legal: Social Security Card', description: 'SSN verification card.', isCommon: true },
    { code: 'LEGAL_ID_MILITARY', label: 'Legal: Military ID (CAC)', description: 'Common Access Card for service members.', isCommon: false },
    { code: 'LEGAL_GIFT', label: 'Legal: Gift Letter', description: 'Donated funds acknowledgment.', isCommon: true },
    { code: 'LEGAL_LOE', label: 'Legal: Letter of Explanation', description: 'Borrower explanatory statement.', isCommon: true },
    { code: 'LEGAL_DOR', label: 'Legal: Deed of Release', description: 'Lien release documentation.', isCommon: false },
    { code: 'LEGAL_POA', label: 'Legal: Power of Attorney', description: 'Legal authorization letter.', isCommon: false },
    { code: 'LEGAL_TRUST', label: 'Legal: Trust Agreement', description: 'Trust instrument documentation.', isCommon: false },
    { code: 'LEGAL_BK', label: 'Legal: Bankruptcy Discharge', description: 'Chapter 7/13 discharge papers.', isCommon: false },
    { code: 'LEGAL_JUDGMENT', label: 'Legal: Judgment Satisfied', description: 'Proof of judgment payoff.', isCommon: false },
    { code: 'LEGAL_DIVORCE', label: 'Legal: Divorce Decree', description: 'Court settlement agreement.', isCommon: false },
    { code: 'LEGALSEP_AGREE', label: 'Legal: Separation Agreement', description: 'Legal separation documentation.', isCommon: false },
    { code: 'LEGAL_ESCROW', label: 'Legal: Escrow Instructions', description: 'Escrow closing instructions.', isCommon: true },
    { code: 'LEGAL_DISCLOSURE', label: 'Legal: State/Local Disclosures', description: 'Required regulatory disclosures.', isCommon: true },
    { code: 'LEGAL_AFFIDAVIT', label: 'Legal: Affidavit of Identity', description: 'Sworn identity statement.', isCommon: false },
    { code: 'LEGAL_MINOR_ADDENDUM', label: 'Legal: Minor Addendum', description: 'Additional legal conditions.', isCommon: false },

    // ── EMPLOYMENT ──
    { code: 'EMP_OFFER_LETTER', label: 'Employment: Offer Letter', description: 'New employment offer documentation.', isCommon: true },
    { code: 'EMP_VERIFICATION', label: 'Employment: VOE (Verification)', description: 'Employer income verification.', isCommon: true },
    { code: 'EMP_W2_TWO_YEAR', label: 'Employment: 2-Year W-2 History', description: 'Two years employment history.', isCommon: true },
    { code: 'EMP_TAX_RET_TWO_YEAR', label: 'Employment: 2-Year Tax Returns', description: 'Two-year income documentation.', isCommon: true },
    { code: 'EMP_BUSINESS_TAX', label: 'Employment: Business Tax Returns', description: 'Self-employed tax documentation.', isCommon: true },
    { code: 'EMP_PROFIT_LOSS', label: 'Employment: YTD Profit & Loss', description: 'Year-to-date business income.', isCommon: true },
    { code: 'EMP_1099_HISTORY', label: 'Employment: 1099 History', description: 'Contractor income history.', isCommon: true },
    { code: 'EMP_RESUME', label: 'Employment: Resume/CV', description: 'Employment history summary.', isCommon: false },
    { code: 'EMP_LICENSE', label: 'Employment: Professional License', description: 'Occupational certification.', isCommon: false },
    { code: 'EMP_LETTER_GAPS', label: 'Employment: Letter re: Employment Gaps', explanation: 'Explanation of work history gaps.', isCommon: false },

    // ── CREDIT ──
    { code: 'CREDIT_REPORT', label: 'Credit: Credit Report', description: 'Tri-merge credit report.', isCommon: true },
    { code: 'CREDIT_SCORE', label: 'Credit: FICO Score Summary', description: 'Credit score documentation.', isCommon: true },
    { code: 'CREDIT_MTG_CREPORT', label: 'Credit: Mortgage Credit Report', description: 'Mortgage-specific credit pull.', isCommon: true },
    { code: 'CREDIT_DISPUTE', label: 'Credit: Dispute Resolution', description: 'Credit dispute documentation.', isCommon: false },
    { code: 'CREDIT_LETTER', label: 'Credit: Explanation Letter', description: 'Credit-related explanation.', isCommon: false },

    // ── VA/SPECIAL PROGRAMS ──
    { code: 'VA_DD214', label: 'VA: DD-214', description: 'Certificate of release from active duty.', isCommon: false },
    { code: 'VA_CERT_ELIG', label: 'VA: Certificate of Eligibility', description: 'VA home loan eligibility.', isCommon: false },
    { code: 'VA_NTL', label: 'VA: Notice of Value (NOV)', description: 'VA appraisal determination.', isCommon: false },
    { code: 'VA_RESIDUAL', label: 'VA: Residual Income Calc', description: 'VA residual income worksheet.', isCommon: false },
    { code: 'FHA_COP', label: 'FHA: Certificate of Occupancy', description: 'FHA property occupancy cert.', isCommon: false },
    { code: 'FHA_SANCTION', label: 'FHA: Sanction/Approval Letter', description: 'FHA lender approval documentation.', isCommon: false },
    { code: 'USDA_CERT', label: 'USDA: Rural Area Certification', description: 'USDA property eligibility.', isCommon: false },

    // ── MISCELLANEOUS ──
    { code: 'MISC_AUTH_TO_RELEASE', label: 'Misc: Authorization to Release', description: 'Third-party information release.', isCommon: true },
    { code: 'MISC_CONDO_CERT', label: 'Misc: Condo Certification', description: 'Condo project eligibility.', isCommon: true },
    { code: 'MISC_RENTAL_AGREE', label: 'Misc: Lease/Rental Agreement', description: 'Current or future lease.', isCommon: false },
    { code: 'MISC_ALIEN_ID', label: 'Misc: Alien Registration Card', description: 'Permanent resident documentation.', isCommon: false },
    { code: 'MISC_VISA', label: 'Misc: Work Visa/H1B', description: 'Non-citizen work authorization.', isCommon: false },
    { code: 'MISC_ITIN', label: 'Misc: ITIN Letter', description: 'Individual taxpayer ID number.', isCommon: false },
    { code: 'MISC_NOCUSTODY', label: 'Misc: No Custody Affidavit', description: 'Affidavit of non-custody.', isCommon: false },
    { code: 'MISC_CHILD_SUPPORT_PROOF', label: 'Misc: Child Support Payment Proof', description: 'Documentation of support payments.', isCommon: false },
    { code: 'MISC_HUD_CONS_COUN', label: 'Misc: HUD Counseling Cert', description: 'HUD-approved counseling cert.', isCommon: false },
    { code: 'MISC_ESCROW_WAIVER', label: 'Misc: Escrow Waiver Request', description: 'Request to waive escrow.', isCommon: false },
    { code: 'MISC_RATE_LOCK', label: 'Misc: Rate Lock Confirmation', description: 'Locked interest rate documentation.', isCommon: true },
    { code: 'MISC_LO_COMMIT', label: 'Misc: Loan Commitment Letter', description: 'Formal loan commitment.', isCommon: true },
    { code: 'MISC_PURP_LETTER', label: 'Misc: Letter of Intent', description: 'Purchase intent letter.', isCommon: false },
    { code: 'MISC_SOURCE_FUNDS', label: 'Misc: Source of Funds Doc', description: 'Large deposit explanation.', isCommon: true },
    { code: 'MISC_MGMT_CERT', label: 'Misc: Management Certification', description: 'Property management cert.', isCommon: false },

    // ── LOAN FILE DOCUMENTS ──
    { code: 'LF_BILLING_STMT', label: 'Loan File: Billing Statements', description: 'Periodic billing statements for loan account.', isCommon: true },
    { code: 'LF_DISCLOSURE', label: 'Loan File: Disclosure', description: 'Original loan file disclosure document.', isCommon: true },
    { code: 'LF_APPRAISAL', label: 'Loan File: Appraisal', description: 'Original loan file appraisal report.', isCommon: true },
    { code: 'LF_INCOME', label: 'Loan File: Income', description: 'Income documentation from original loan file.', isCommon: true },
    { code: 'LF_FLOOD_INFO', label: 'Loan File: Flood Information', description: 'Flood zone determination and insurance.', isCommon: true },
    { code: 'LF_HUD1_CD', label: 'Loan File: HUD1/Closing Disclosure', description: 'HUD-1 or Closing Disclosure settlement stmt.', isCommon: true },
    { code: 'LF_MISC_ESCROW', label: 'Loan File: Miscellaneous Escrow', description: 'Escrow-related miscellaneous documents.', isCommon: true },
    { code: 'LF_NOTE_ADDENDUM', label: 'Loan File: Note and Addendums/Allonges', description: 'Promissory note with allonges and addendums.', isCommon: true },
    { code: 'LF_OCCUPANCY', label: 'Loan File: Occupancy Statement', description: 'Borrower occupancy declaration.', isCommon: true },
    { code: 'LF_INITIAL_ESCROW', label: 'Loan File: Initial Escrow Account Disclosure', description: 'Initial escrow account setup statement.', isCommon: true },
    { code: 'LF_1ST_PAYMENT', label: 'Loan File: 1st Payment Letter', description: 'First payment due date notification.', isCommon: true },
    { code: 'LF_VA_CERT_ELIG', label: 'Loan File: VA Certificate of Eligibility', description: 'VA loan eligibility certificate.', isCommon: false },
    { code: 'LF_MORTGAGE_DEED', label: 'Loan File: Mortgage/Deed of Trust', description: 'Original mortgage deed of trust document.', isCommon: true },
    { code: 'LF_APPLICATION', label: 'Loan File: Application', description: 'Original loan application.', isCommon: true },
    { code: 'LF_INSURANCE_INFO', label: 'Loan File: Insurance Information', description: 'Insurance policy documentation.', isCommon: true },
    { code: 'LF_POA', label: 'Loan File: Power of Attorney', description: 'Power of attorney authorization.', isCommon: false },
    { code: 'LF_MISC_ORIG', label: 'Loan File: Miscellaneous - Original', description: 'Miscellaneous original loan file documents.', isCommon: true },
    { code: 'LF_CREDIT', label: 'Loan File: Credit', description: 'Credit report and related documents.', isCommon: true },
    { code: 'LF_W9', label: 'Loan File: W-9', description: 'Request for Taxpayer ID Number.', isCommon: true },
    { code: 'LF_SCIF', label: 'Loan File: Supplemental Consumer Info Form', description: 'Supplemental consumer information form.', isCommon: true },
    { code: 'LF_SIG_AFFIDAVIT', label: 'Loan File: Signature Name Affidavit', description: 'Affidavit of signature and name.', isCommon: true },
    { code: 'LF_INS_ESCROW', label: 'Loan File: Insurance Information - Escrow', description: 'Insurance docs for escrow account.', isCommon: true },
    { code: 'LF_PRIVACY_NOTICE', label: 'Loan File: Privacy Notice', description: 'Consumer privacy notice document.', isCommon: true },
    { code: 'LF_CLOSING_PROT', label: 'Loan File: Closing Protection Letter', description: 'Title company closing protection.', isCommon: true },
    { code: 'LF_ID_DOCS', label: 'Loan File: Identity Documents', description: 'Identity verification documents.', isCommon: true },
    { code: 'LF_CASH_MGMT', label: 'Loan File: Payment Related - Cash Management', description: 'Cash management payment documents.', isCommon: false },
    { code: 'LF_GFE', label: 'Loan File: Good Faith Estimate', description: 'Good Faith Estimate / Loan Estimate.', isCommon: true },
    { code: 'LF_AUS_FINDINGS', label: 'Loan File: AUS Findings', description: 'Automated Underwriting System findings.', isCommon: true },
    { code: 'LF_CERT_DISBURSE', label: 'Loan File: Report of Certification of Loan Disbursement', description: 'Loan disbursement certification report.', isCommon: true },
    { code: 'LF_TITLE_COMMIT', label: 'Loan File: Title Commitment', description: 'Original loan file title commitment.', isCommon: true },
  ];

  console.log(`Seeding ${types.length} Document Types...`);

  let created = 0;
  let updated = 0;

  for (const t of types) {
    const result = await prisma.configuredDocType.upsert({
      where: { code: t.code },
      update: { label: t.label, description: t.description, isCommon: t.isCommon },
      create: { code: t.code, label: t.label, description: t.description, isCommon: t.isCommon }
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) created++;
    else updated++;
  }

  console.log(`✅ Done: ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
