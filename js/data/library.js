// The library: exactly 12 items (8 supports S1–S8, 4 obligations O1–O4).
// Source: UX_SPEC.md section 4, researched and checked on 28 Oct 2026.
//
// Names, agencies, "gives" lines, status notes and quotes stay in English in
// every language (proper names and source text). They are shown with lang="en".
//
// Quotes were re-checked word for word on the live pages by the lead on
// 28 Oct 2026 (prototype-spec/QUOTE_CHECK.md). S7 is a labelled secondary
// source; O1 and O4 were extracted exactly from the PDF text.
//
// rules: ids of the eligibility rules in js/rules.js.
// relevance: weight per intent detected in the owner's text (spec 4.1 step 2).
// draft: true when "Prepare my form" is offered for this item.
// neverBest: true keeps an item out of "Best matches" (spec 4.1: S7 and S8
// always sit at the bottom of "Also worth checking").

export const CHECKED_DATE = '2026-10-28';

// The verified EDB portal page (used by S1–S4 and the honest-gap card).
// There is deliberately NO SME Mauritius URL anywhere: none was verified.
export const EDB_PORTAL = 'https://business-support-portal.edbmauritius.org/schemes/';

export const LIBRARY = [
  {
    id: 'S1',
    type: 'grant',
    name: 'SME Mauritius Technology and Innovation Scheme',
    title: 'Technology and Innovation Scheme',
    agency: 'SME Mauritius',
    gives: '80% of cost, max Rs 150,000. Young ("29 years" on the page) and women entrepreneurs: full grant up to Rs 50,000.',
    rules: ['sme', 'any', 'youngWomen'],
    quote: 'Grant value of 80% of total costs up to a maximum of Rs 150,000',
    sources: [EDB_PORTAL],
    status: 'unconfirmed',
    statusNote: 'The page content dates from 2020–2022. Check it is still open.',
    relevance: { equipment: 3 },
    draft: true,
  },
  {
    id: 'S2',
    type: 'grant',
    name: 'SME Marketing Support Scheme',
    title: 'Marketing Support Scheme',
    agency: 'SME Mauritius',
    gives: '80% of marketing costs, max Rs 150,000. Admin costs: 80% per transaction, max Rs 15,000.',
    rules: ['sme'],
    quote: 'Others: grant value of 80% of total costs up to a maximum of Rs 150,000',
    sources: [EDB_PORTAL],
    status: 'unconfirmed',
    statusNote: 'Figures from Sept 2020.',
    relevance: { marketing: 3, export: 2 },
    draft: true,
  },
  {
    id: 'S3',
    type: 'grant',
    name: 'Made in Moris Scheme',
    title: 'Made in Moris Scheme',
    agency: 'SME Mauritius',
    gives: 'One-off grant up to Rs 50,000 towards "Made in Moris" certification.',
    rules: ['sme', 'localMade'],
    quote: 'A one-off grant up to a maximum of Rs 50,000 is available to SMEs towards certification under “Made in Moris” label.',
    sources: [EDB_PORTAL],
    status: 'unconfirmed',
    statusNote: 'Page undated.',
    relevance: { export: 3, marketing: 2 },
    draft: true,
  },
  {
    id: 'S4',
    type: 'grant',
    name: 'National SME Incubator Scheme (NSIS)',
    title: 'National SME Incubator Scheme (NSIS)',
    agency: 'MRIC, via accredited incubators',
    gives: '50:50 matching grant by stage: pre-incubation max Rs 50,000 (9 months); incubation max Rs 400,000 (18 months); acceleration max Rs 300,000 (6 months).',
    rules: ['sme', 'stage'],
    quote: 'The NSIS ensures a structured training/ mentoring approach to start-ups, provided by the NSIS Accredited Incubators in three phases',
    sources: ['https://www.mric.mu/national-sme-inubator-scheme'],
    status: 'unconfirmed',
    statusNote: "Amounts from a secondary listing: the Rs 50,000 / 400,000 / 300,000 caps and the 50:50 matching are not on MRIC's page. You apply through an accredited incubator.",
    relevance: { start: 3, hire: 1 },
    draft: true,
  },
  {
    id: 'S5',
    type: 'loan',
    name: 'MauBank SME LokalBoost',
    title: 'SME LokalBoost',
    agency: 'MauBank',
    gives: 'Business loan up to MUR 10 M; equipment leasing up to MUR 5 M (up to 85% of new equipment).',
    rules: ['t30', 'place', 'track'],
    quote: 'Eligibility: Businesses with a turnover not exceeding MUR 30 million.',
    sources: ['https://maubank.mu/sme-lokalboost/'],
    status: 'confirmed',
    statusNote: "Limit and amounts read on MauBank's page; the bank decides each loan.",
    relevance: { loan: 3, equipment: 2, start: 1 },
    draft: true,
  },
  {
    id: 'S6',
    type: 'loan',
    name: 'DBM Business Loan Scheme',
    title: 'Business Loan Scheme',
    agency: 'Development Bank of Mauritius',
    gives: 'Up to Rs 25,000,000.',
    rules: ['scope', 'dbm'],
    quote: 'Up to a maximum of Rs 25,000,000',
    sources: ['https://www.dbm.mu/loans/business-loan-scheme/'],
    status: 'confirmed',
    statusNote: "Amount read on DBM's page (moratorium up to 6 months, repayment up to 7 years); the bank decides each loan. DBM also has a Women Entrepreneur Loan Scheme (up to Rs 1,000,000).",
    relevance: { loan: 3, start: 1 },
    draft: true,
  },
  {
    id: 'S7',
    type: 'tax',
    name: 'Start-up 10-year income tax holiday',
    title: 'Start-up 10-year income tax holiday',
    agency: 'MRA (Budget 2026-27)',
    gives: 'No income tax for 10 years from the start of operations, for qualifying start-ups.',
    rules: ['scope', 'startup', 'conditions'],
    // A secondary source: shown under "Rule as reported", not "Official rule".
    quote: 'Start-ups shall benefit from a 10-year income tax holiday, applicable from the date they commence operations.',
    quoteKind: 'reported',
    quoteBy: 'Forvis Mazars',
    sources: [
      'https://www.forvismazars.com/mu/en/content/download/1300557/file/Forvis%20Mazars%20Mauritius%20Budget%20Key%20highlights%202026.pdf',
      'https://kpmg.com/us/en/taxnewsflash/news/2026/08/mauritius-finance-act-2026-income-tax-vat-pillar-two-digital-services.html',
    ],
    status: 'announced',
    statusNote: 'In the Budget of 19 June 2026. KPMG (18 Aug 2026) says the Finance Act 2026 introduced it "for qualifying start-up enterprises meeting specified conditions"; we have not seen the conditions.',
    relevance: { start: 3 },
    draft: false,
    neverBest: true,
  },
  {
    id: 'S8',
    type: 'grant',
    name: 'MRIC Proof of Concept Scheme',
    title: 'Proof of Concept Scheme',
    agency: 'MRIC',
    gives: 'Amount unclear: sources say up to Rs 1 M (12 months) or up to Rs 2 M (24 months).',
    rules: ['scope', 'priority', 'entity'],
    quote: 'All the eligible entities must be already existing legal entities registered in the Republic of Mauritius;',
    sources: ['https://www.mric.mu/proof-of-concept-scheme'],
    status: 'unconfirmed',
    statusNote: 'Amount unclear (Rs 1 M or Rs 2 M in other listings); the last call we saw closed on 5 Mar 2026. Check with MRIC before applying.',
    relevance: {},
    draft: false,
    neverBest: true,
  },
  {
    id: 'O1',
    type: 'obligation',
    name: 'Business Registration Number (BRN)',
    title: 'Business Registration Number (BRN)',
    agency: 'Corporate and Business Registration Department',
    gives: 'Applies to everyone carrying on business in Mauritius.',
    rules: ['anyBiz'],
    quote: 'Subject to the other provisions of this Act, no person shall carry on any business in Mauritius unless he is registered under this Act.',
    quoteRef: 's.6(1)',
    sources: ['https://www.mcci.org/media/35748/the-business-registration-act-2002-updated.pdf'],
    status: 'confirmed',
    statusNote: 'Quoted from a 2015 compiled copy of the Business Registration Act 2002.',
    relevance: { register: 3, start: 3 },
    draft: false,
  },
  {
    id: 'O2',
    type: 'obligation',
    name: 'VAT registration',
    title: 'VAT registration',
    agency: 'MRA',
    gives: 'Register for VAT when yearly taxable sales go over Rs 3 M.',
    rules: ['vat'],
    quote: 'its annual turnover of taxable supplies exceeds or is likely to exceed 3 million rupees',
    sources: ['https://www.mra.mu/index.php/28-sme-corner/252-introductory-note-guidelines-for-smes'],
    status: 'confirmed',
    statusNote: 'Some business types must register whatever their sales (10th Schedule of the VAT Act).',
    relevance: { register: 2 },
    draft: false,
  },
  {
    id: 'O3',
    type: 'obligation',
    name: 'NSF contributions',
    title: 'NSF contributions',
    agency: 'MRA',
    gives: "You pay 2.5% of each employee's basic wage and they pay 1%; the maximum wage counted is Rs 29,710 a month from 1 July 2026.",
    rules: ['employer'],
    quote: 'Employee & Employer share of contributions are 1 % and 2.5% respectively',
    sources: ['https://www.mra.mu/index.php/employers/npf-nsf-contributions'],
    status: 'confirmed',
    statusNote: '',
    relevance: { hire: 3 },
    draft: false,
  },
  {
    id: 'O4',
    type: 'obligation',
    name: 'Food business registration',
    title: 'Food business registration',
    agency: 'Food Act 2022 (Act No. 12 of 2022)',
    gives: 'Register as a food business operator, via the business register.',
    rules: ['food'],
    quote: 'No person shall operate a food business unless he is registered under section 6 of the Business Registration Act.',
    sources: ['https://mauritiusassembly.govmu.org/mauritiusassembly/wp-content/uploads/2023/03/act1222.pdf'],
    status: 'unconfirmed',
    statusNote: 'Law text from the National Assembly copy; reported in force since 15 June 2024, not checked.',
    relevance: { register: 2, start: 2 },
    draft: false,
  },
];

// Find one item by its id ('S1', 'O4', ...).
export function getItem(id) {
  return LIBRARY.find((item) => item.id === id);
}
