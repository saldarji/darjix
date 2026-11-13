export interface DebtBucket {
  id: string;
  name: string;
  shortName: string;
  amountMillions: number;
  sharePercent: number;
  category: 'long-term-go' | 'pob' | 'short-term-ban' | 'dif';
  interestType: 'Fixed Tax-Exempt' | 'Fixed Taxable (POB)' | 'Variable / Short-Term Rollover' | 'Mixed (Bonds + BANs)';
  avgRatePercent: number;
  maturityHorizon: string;
  cityRationale: string;
  taxpayerRisk: string;
  riskSeverity: 'Moderate' | 'High' | 'Critical';
  examples: string[];
  colorHex: string;
}

export interface AnnualDebtScheduleRow {
  fiscalYear: number;
  goBondPrincipalM: number;
  goBondInterestM: number;
  pobPrincipalM: number;
  pobInterestM: number;
  difDebtServiceM: number;
  enterpriseDebtServiceM: number;
  shortTermBanMaturityM: number; // Maturing within 12-18 months requiring rollover or bonding
}

export interface PeerCityProfile {
  city:
    | 'Quincy'
    | 'Cambridge'
    | 'Somerville'
    | 'Medford'
    | 'Brockton'
    | 'Lynn'
    | 'Springfield'
    | 'New Bedford';
  peerGroup: 'Subject City' | 'Inner-Core Metro' | 'MA Gateway Cities';
  Archetype: string;
  population: number;
  operatingBudgetM: number;
  totalDirectAndShortTermDebtM: number;
  shortTermBanExposureM: number;
  pobOutstandingM: number;
  annualDebtServiceM: number;
  debtServicePctOfBudget: number;
  debtPerCapita: number;
  debtPctOfEQV: number;
  freeCashAndStabilizationM: number;
  bondRating: string;
  narrativeSummary: string;
  taxpayerTakeaway: string;
}

export const QUINCY_HEADLINE_METRICS = {
  comprehensiveDebtFootprintM: 1618.0, // ~$1.62B total exposure across bonded debt, POBs, BANs, and DIF obligations
  population: 101636, // US Census / MA DLS estimate
  households: 44800,
  fy2025OperatingBudgetM: 478.5,
  fy2025TotalDebtServiceM: 88.8, // ~18.56% of budget
  annualPobDebtServiceM: 37.2, // Fixed annual POB commitment through 2040
  shortTermBansOutstandingM: 508.0, // Short-term Bond Anticipation Notes requiring rollover or permanent financing
  pobPrincipalIssuedM: 475.0,
  generalCapitalBondsM: 425.0, // Non-POB, non-DIF general & school/water/sewer long-term bonds
  quincyCenterDifExposureM: 210.0, // Downtown revitalization DIF long-term & short-term authorizations
  creditRatingSP: 'AA (Stable) / SP-1+ Short-Term',
  averageSingleFamilyTaxBill: 6680,
};

export const QUINCY_DEBT_BUCKETS: DebtBucket[] = [
  {
    id: 'short-term-bans',
    name: 'Short-Term Bond Anticipation Notes (BANs)',
    shortName: 'Short-Term BANs',
    amountMillions: 508.0,
    sharePercent: 31.4,
    category: 'short-term-ban',
    interestType: 'Variable / Short-Term Rollover',
    avgRatePercent: 4.25,
    maturityHorizon: 'Rolling 6–12 Month Maturities',
    cityRationale:
      'Used as municipal "construction bridge loans" to fund active capital projects (like Squantum Elementary School, public safety facilities, and downtown infrastructure) before issuing permanent 20- or 30-year bonds, giving the city timing flexibility.',
    taxpayerRisk:
      'Refinancing & Interest Rate Shock: Unlike fixed-rate bonds locked in during 2020–2021 at <2%, half a billion dollars in short-term BANs must be rolled over or permanently bonded in today’s higher interest rate environment. Every +1% increase in permanent bond rates adds ~$5M+ per year to taxpayer debt service for decades.',
    riskSeverity: 'Critical',
    examples: [
      'Squantum Elementary School Construction Notes',
      'Public Safety Headquarters & Fire Station Renovations',
      'Roadway, Seawall & Municipal Facility Bridge Notes',
    ],
    colorHex: '#F1562E', // Bright Orange alert
  },
  {
    id: 'pension-obligation-bonds',
    name: 'Pension Obligation Bonds (2021 POB Issuance)',
    shortName: 'Pension Bonds (POB)',
    amountMillions: 475.0,
    sharePercent: 29.4,
    category: 'pob',
    interestType: 'Fixed Taxable (POB)',
    avgRatePercent: 2.89,
    maturityHorizon: 'Fixed through FY2040',
    cityRationale:
      'Issued in late 2021 to pay off the Quincy Retirement System’s unfunded actuarial liability in one lump sum, betting that long-term pension investment returns (~7.0% target) will exceed the ~2.89% taxable bond interest rate.',
    taxpayerRisk:
      'Market Arbitrage & Budget Rigidity Risk: Turns a flexible actuarial schedule into an unbreakable legal bond obligation of ~$37.2M every year. If financial markets suffer a prolonged downturn and earn less than expected, taxpayers face a "double whammy": paying the fixed $37.2M bond bill PLUS paying new unfunded pension assessments.',
    riskSeverity: 'High',
    examples: [
      'Series 2021 Taxable General Obligation Pension Bonds ($465.3M–$475M total structure)',
      '$37.2M mandatory annual operating budget appropriation',
    ],
    colorHex: '#f2c150', // Warm Gold warning
  },
  {
    id: 'general-capital-bonds',
    name: 'General Obligation Capital & Utility Bonds',
    shortName: 'Core Capital GO Bonds',
    amountMillions: 425.0,
    sharePercent: 26.3,
    category: 'long-term-go',
    interestType: 'Fixed Tax-Exempt',
    avgRatePercent: 3.15,
    maturityHorizon: 'Staggered through FY2052',
    cityRationale:
      'Traditional municipal borrowing for long-lived physical infrastructure—new schools, water/sewer mains, parks, seawalls, and municipal buildings—spreading cost across the generations of residents who use them.',
    taxpayerRisk:
      'Proposition 2½ Operating Squeeze: Because Quincy funds nearly all capital debt inside its general tax levy rather than asking voters for Proposition 2½ "Debt Exclusions," rising capital debt service directly crowds out funding for school operations, road maintenance, and library hours.',
    riskSeverity: 'Moderate',
    examples: [
      'High School & Middle School Construction Bonds',
      'MWRA / MCWT Clean Water & Sewer Infrastructure Loans',
      'Coastal Seawall & Flood Mitigation Bonds',
    ],
    colorHex: '#3182ed', // Bright Blue
  },
  {
    id: 'quincy-center-dif',
    name: 'Quincy Center District Improvement Financing (DIF)',
    shortName: 'Quincy Center DIF',
    amountMillions: 210.0,
    sharePercent: 12.9,
    category: 'dif',
    interestType: 'Mixed (Bonds + BANs)',
    avgRatePercent: 3.85,
    maturityHorizon: '2025–2050+ (Rollover + Long-Term)',
    cityRationale:
      'Finances massive public parking garages, underground utilities, and streetscapes in downtown Quincy Center under the premise that new private commercial and apartment developments will generate enough incremental property tax revenue ("Tax Increment") to pay for the bonds.',
    taxpayerRisk:
      'Commercial Real Estate & Vacancy Risk: DIF bonds are still backed by the full faith and credit of the City of Quincy. If downtown commercial/residential development slows down, assessments plateau, or construction costs exceed projections, residential homeowners citywide must subsidize the shortfall from the General Fund.',
    riskSeverity: 'High',
    examples: [
      'Hancock Garage & Kilroy Square Infrastructure',
      'Downtown Quincy Center Utility & Streetscape Overhaul',
      'DIF Short-Term Notes Awaiting Permanent Takeout',
    ],
    colorHex: '#2ab7a6', // Teal
  },
];

// Projected multi-year debt service schedule (FY2025 - FY2045) in $ Millions
// Combines scheduled long-term principal/interest with the FY2025-2026 short-term BAN maturity wall
export const QUINCY_MATURITY_SCHEDULE: AnnualDebtScheduleRow[] = [
  { fiscalYear: 2025, goBondPrincipalM: 19.4, goBondInterestM: 11.8, pobPrincipalM: 24.1, pobInterestM: 13.1, difDebtServiceM: 11.2, enterpriseDebtServiceM: 9.2, shortTermBanMaturityM: 318.0 },
  { fiscalYear: 2026, goBondPrincipalM: 20.1, goBondInterestM: 11.2, pobPrincipalM: 24.8, pobInterestM: 12.4, difDebtServiceM: 12.0, enterpriseDebtServiceM: 9.4, shortTermBanMaturityM: 190.0 },
  { fiscalYear: 2027, goBondPrincipalM: 19.8, goBondInterestM: 10.5, pobPrincipalM: 25.5, pobInterestM: 11.7, difDebtServiceM: 12.4, enterpriseDebtServiceM: 9.1, shortTermBanMaturityM: 0 },
  { fiscalYear: 2028, goBondPrincipalM: 19.2, goBondInterestM: 9.8, pobPrincipalM: 26.2, pobInterestM: 11.0, difDebtServiceM: 12.6, enterpriseDebtServiceM: 8.9, shortTermBanMaturityM: 0 },
  { fiscalYear: 2029, goBondPrincipalM: 18.5, goBondInterestM: 9.1, pobPrincipalM: 27.0, pobInterestM: 10.2, difDebtServiceM: 12.8, enterpriseDebtServiceM: 8.6, shortTermBanMaturityM: 0 },
  { fiscalYear: 2030, goBondPrincipalM: 17.9, goBondInterestM: 8.4, pobPrincipalM: 27.8, pobInterestM: 9.4, difDebtServiceM: 12.9, enterpriseDebtServiceM: 8.3, shortTermBanMaturityM: 0 },
  { fiscalYear: 2031, goBondPrincipalM: 17.1, goBondInterestM: 7.7, pobPrincipalM: 28.6, pobInterestM: 8.6, difDebtServiceM: 12.9, enterpriseDebtServiceM: 8.0, shortTermBanMaturityM: 0 },
  { fiscalYear: 2032, goBondPrincipalM: 16.4, goBondInterestM: 7.1, pobPrincipalM: 29.5, pobInterestM: 7.7, difDebtServiceM: 12.8, enterpriseDebtServiceM: 7.7, shortTermBanMaturityM: 0 },
  { fiscalYear: 2033, goBondPrincipalM: 15.8, goBondInterestM: 6.5, pobPrincipalM: 30.4, pobInterestM: 6.8, difDebtServiceM: 12.6, enterpriseDebtServiceM: 7.4, shortTermBanMaturityM: 0 },
  { fiscalYear: 2034, goBondPrincipalM: 15.1, goBondInterestM: 5.9, pobPrincipalM: 31.3, pobInterestM: 5.9, difDebtServiceM: 12.4, enterpriseDebtServiceM: 7.1, shortTermBanMaturityM: 0 },
  { fiscalYear: 2035, goBondPrincipalM: 14.3, goBondInterestM: 5.3, pobPrincipalM: 32.3, pobInterestM: 4.9, difDebtServiceM: 12.1, enterpriseDebtServiceM: 6.8, shortTermBanMaturityM: 0 },
  { fiscalYear: 2036, goBondPrincipalM: 13.5, goBondInterestM: 4.8, pobPrincipalM: 33.3, pobInterestM: 3.9, difDebtServiceM: 11.8, enterpriseDebtServiceM: 6.4, shortTermBanMaturityM: 0 },
  { fiscalYear: 2037, goBondPrincipalM: 12.7, goBondInterestM: 4.2, pobPrincipalM: 34.3, pobInterestM: 2.9, difDebtServiceM: 11.5, enterpriseDebtServiceM: 6.0, shortTermBanMaturityM: 0 },
  { fiscalYear: 2038, goBondPrincipalM: 11.9, goBondInterestM: 3.7, pobPrincipalM: 35.4, pobInterestM: 1.8, difDebtServiceM: 11.1, enterpriseDebtServiceM: 5.6, shortTermBanMaturityM: 0 },
  { fiscalYear: 2039, goBondPrincipalM: 11.1, goBondInterestM: 3.2, pobPrincipalM: 36.5, pobInterestM: 0.7, difDebtServiceM: 10.7, enterpriseDebtServiceM: 5.2, shortTermBanMaturityM: 0 },
  { fiscalYear: 2040, goBondPrincipalM: 10.4, goBondInterestM: 2.7, pobPrincipalM: 18.2, pobInterestM: 0.2, difDebtServiceM: 10.3, enterpriseDebtServiceM: 4.8, shortTermBanMaturityM: 0 },
  { fiscalYear: 2041, goBondPrincipalM: 9.6, goBondInterestM: 2.2, pobPrincipalM: 0, pobInterestM: 0, difDebtServiceM: 9.8, enterpriseDebtServiceM: 4.4, shortTermBanMaturityM: 0 },
  { fiscalYear: 2042, goBondPrincipalM: 8.8, goBondInterestM: 1.8, pobPrincipalM: 0, pobInterestM: 0, difDebtServiceM: 9.2, enterpriseDebtServiceM: 4.0, shortTermBanMaturityM: 0 },
  { fiscalYear: 2043, goBondPrincipalM: 8.0, goBondInterestM: 1.4, pobPrincipalM: 0, pobInterestM: 0, difDebtServiceM: 8.6, enterpriseDebtServiceM: 3.5, shortTermBanMaturityM: 0 },
  { fiscalYear: 2044, goBondPrincipalM: 7.2, goBondInterestM: 1.0, pobPrincipalM: 0, pobInterestM: 0, difDebtServiceM: 8.0, enterpriseDebtServiceM: 3.1, shortTermBanMaturityM: 0 },
  { fiscalYear: 2045, goBondPrincipalM: 6.4, goBondInterestM: 0.7, pobPrincipalM: 0, pobInterestM: 0, difDebtServiceM: 7.4, enterpriseDebtServiceM: 2.7, shortTermBanMaturityM: 0 },
];

export const PEER_CITIES_COMPARISON: PeerCityProfile[] = [
  {
    city: 'Quincy',
    peerGroup: 'Subject City',
    Archetype: 'High-Leverage Growth & Pension Bonding',
    population: 101636,
    operatingBudgetM: 478.5,
    totalDirectAndShortTermDebtM: 1618.0,
    shortTermBanExposureM: 508.0,
    pobOutstandingM: 416.0,
    annualDebtServiceM: 88.8,
    debtServicePctOfBudget: 18.6,
    debtPerCapita: 15919,
    debtPctOfEQV: 6.42,
    freeCashAndStabilizationM: 36.5,
    bondRating: 'AA (S&P)',
    narrativeSummary:
      'Quincy has aggressively used municipal debt to remake Quincy Center (DIF), replace schools, and bond its entire pension liability ($475M POB), while carrying over $500M in short-term BANs.',
    taxpayerTakeaway:
      'Highest debt-service bite in the 8-city comparison (~18.6% of budget) and lowest reserve cushion relative to short-term BAN exposure.',
  },
  {
    city: 'Cambridge',
    peerGroup: 'Inner-Core Metro',
    Archetype: 'AAA Biotech Commercial Fortress',
    population: 118488,
    operatingBudgetM: 926.0,
    totalDirectAndShortTermDebtM: 615.0,
    shortTermBanExposureM: 45.0,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 84.5,
    debtServicePctOfBudget: 9.1,
    debtPerCapita: 5190,
    debtPctOfEQV: 0.89,
    freeCashAndStabilizationM: 295.0,
    bondRating: 'AAA (S&P / Moody’s / Fitch)',
    narrativeSummary:
      'Backed by Kendall Square’s massive commercial and lab property tax base, Cambridge funds major capital projects with a mix of pay-as-you-go cash and 10-year rapid-paydown bonds, with zero Pension Obligation Bonds.',
    taxpayerTakeaway:
      'Spends half as much of its budget on debt service (9.1% vs. Quincy’s 18.6%) while holding ~8x more in Free Cash & Reserves.',
  },
  {
    city: 'Somerville',
    peerGroup: 'Inner-Core Metro',
    Archetype: 'Managed Transit & School Expansion',
    population: 81045,
    operatingBudgetM: 362.0,
    totalDirectAndShortTermDebtM: 438.0,
    shortTermBanExposureM: 68.0,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 36.8,
    debtServicePctOfBudget: 10.2,
    debtPerCapita: 5404,
    debtPctOfEQV: 1.92,
    freeCashAndStabilizationM: 74.0,
    bondRating: 'AA+ (S&P)',
    narrativeSummary:
      'Absorbed major capital investments (Somerville High School, Green Line Extension contribution, Union Square infrastructure) by pairing targeted stabilization funds with voter-approved debt exclusions.',
    taxpayerTakeaway:
      'Despite rapid urban transformation similar to Quincy, Somerville kept per-capita debt at ~1/3 of Quincy’s level and avoided pension bonds.',
  },
  {
    city: 'Medford',
    peerGroup: 'Inner-Core Metro',
    Archetype: 'Historically Debt-Averse / Infrastructure Catch-Up',
    population: 59659,
    operatingBudgetM: 212.0,
    totalDirectAndShortTermDebtM: 84.0,
    shortTermBanExposureM: 14.0,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 9.1,
    debtServicePctOfBudget: 4.3,
    debtPerCapita: 1408,
    debtPctOfEQV: 0.68,
    freeCashAndStabilizationM: 31.0,
    bondRating: 'AA+ (S&P)',
    narrativeSummary:
      'Represents the opposite end of the municipal spectrum: decades of minimal borrowing kept debt service under 5% of the budget, but left deferred maintenance in schools, fire stations, and roads.',
    taxpayerTakeaway:
      'Illustrates the trade-off of under-borrowing: low financial debt on paper, but high physical "infrastructure debt" now requiring Prop 2½ overrides.',
  },
  {
    city: 'Brockton',
    peerGroup: 'MA Gateway Cities',
    Archetype: 'Fellow POB Issuer Under Budget Strain',
    population: 105643,
    operatingBudgetM: 480.5,
    totalDirectAndShortTermDebtM: 485.0,
    shortTermBanExposureM: 28.0,
    pobOutstandingM: 300.0,
    annualDebtServiceM: 33.6,
    debtServicePctOfBudget: 7.0,
    debtPerCapita: 4591,
    debtPctOfEQV: 3.85,
    freeCashAndStabilizationM: 24.5,
    bondRating: 'AA- (S&P, Stable)',
    narrativeSummary:
      'Like Quincy, Brockton issued a major Pension Obligation Bond ($300M in 2021 plus a ~$59M follow-on authorization) and operates on a nearly identical ~$480M budget scale, though it relies far less on short-term BANs.',
    taxpayerTakeaway:
      'Closest structural peer to Quincy on pension bonding—yet Brockton’s debt per capita ($4,591) is under 1/3 of Quincy’s, though school deficits forced heavy reserve draws.',
  },
  {
    city: 'Lynn',
    peerGroup: 'MA Gateway Cities',
    Archetype: 'Post-Oversight Fiscal Turnaround (~102k Twin)',
    population: 102300,
    operatingBudgetM: 517.3,
    totalDirectAndShortTermDebtM: 108.0,
    shortTermBanExposureM: 15.0,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 14.5,
    debtServicePctOfBudget: 2.8,
    debtPerCapita: 1056,
    debtPctOfEQV: 0.95,
    freeCashAndStabilizationM: 35.0,
    bondRating: 'AA / A1 (Moody’s)',
    narrativeSummary:
      'Nearly identical in population to Quincy (~102,300 vs. 101,636) with a slightly larger $517.3M FY25 operating budget. After exiting state fiscal oversight, Lynn paid off deficit bonds and rebuilt ~$30M+ in reserves before new school borrowing.',
    taxpayerTakeaway:
      'Carries ~1/15th of Quincy’s total debt footprint ($108M vs. $1,618M) and spends just 2.8% of its operating budget on debt service.',
  },
  {
    city: 'Springfield',
    peerGroup: 'MA Gateway Cities',
    Archetype: 'Large-Scale Discipline & Reserve Builder',
    population: 154702,
    operatingBudgetM: 928.7,
    totalDirectAndShortTermDebtM: 235.0,
    shortTermBanExposureM: 12.0,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 22.3,
    debtServicePctOfBudget: 2.4,
    debtPerCapita: 1519,
    debtPctOfEQV: 1.70,
    freeCashAndStabilizationM: 90.3,
    bondRating: 'AA- (S&P, Stable)',
    narrativeSummary:
      'Massachusetts’ 3rd-largest city operates a $928.7M FY25 budget—nearly double Quincy’s—while keeping permanent GO principal modest (~$223M–$241M) on a declining debt curve and balancing 10 straight budgets without tapping reserves.',
    taxpayerTakeaway:
      'With 52% more residents than Quincy, Springfield holds 2.5x more in stabilization & free cash ($90.3M) while spending just 2.4% of its budget on debt service.',
  },
  {
    city: 'New Bedford',
    peerGroup: 'MA Gateway Cities',
    Archetype: 'Low-Bonding Budget Twin (Unfunded OPEB Trade-Off)',
    population: 101834,
    operatingBudgetM: 478.7,
    totalDirectAndShortTermDebtM: 185.0,
    shortTermBanExposureM: 40.8,
    pobOutstandingM: 0.0,
    annualDebtServiceM: 12.7,
    debtServicePctOfBudget: 2.7,
    debtPerCapita: 1817,
    debtPctOfEQV: 1.65,
    freeCashAndStabilizationM: 26.0,
    bondRating: 'AA- (S&P) / AA+ Enhanced',
    narrativeSummary:
      'Almost an exact population and general-fund twin to Quincy (101,834 residents; $478.7M FY25 General Fund), New Bedford caps debt service well below its 10% ceiling (~$12.7M/yr) while carrying unfunded pension ($387M) and OPEB ($500M) liabilities rather than issuing POBs.',
    taxpayerTakeaway:
      'Demonstrates the POB contrast: New Bedford keeps bonded debt service at 2.7% of its budget (~$12.7M vs. Quincy’s $88.8M), leaving pension/OPEB costs on an actuarial schedule instead of rigid bond payments.',
  },
];

export const US_TREASURY_BENCHMARKS = {
  presets: [
    {
      id: 'zero-era-2021',
      label: '2021 Zero-Rate Era',
      sublabel: 'When Quincy issued POBs & started BANs',
      tBill1YrRate: 0.15,
      treasury10YrRate: 1.45,
      muniBondRefiRate: 2.15,
      shortTermBanRate: 1.10,
    },
    {
      id: 'current-market',
      label: 'Current T-Bill / Muni Market',
      sublabel: 'Elevated post-tightening yield curve',
      tBill1YrRate: 4.30,
      treasury10YrRate: 4.25,
      muniBondRefiRate: 4.15,
      shortTermBanRate: 4.25,
    },
    {
      id: 'higher-for-longer',
      label: 'Higher-for-Longer Stress',
      sublabel: 'Persistent inflation / credit spread widening',
      tBill1YrRate: 5.25,
      treasury10YrRate: 5.10,
      muniBondRefiRate: 5.25,
      shortTermBanRate: 5.40,
    },
    {
      id: 'stagflation-shock',
      label: '1980s / Stagflation Shock',
      sublabel: 'Severe municipal refinancing squeeze',
      tBill1YrRate: 6.50,
      treasury10YrRate: 6.25,
      muniBondRefiRate: 6.50,
      shortTermBanRate: 6.75,
    },
  ],
  opportunityCostUnitCosts: {
    publicSchoolTeacherSalaryAndBenefits: 92000, // ~$92k avg salary + benefits
    firefighterPoliceOfficerFullCost: 108000, // ~$108k avg salary + benefits
    mileOfRoadRepavingCost: 360000, // ~$360k per mile mill & overlay
    elementaryClassroomAnnualBudget: 245000,
  },
  usNationalDebtComparison: {
    usTotalPublicDebtTrillions: 36.2,
    usPopulationMillions: 336.5,
    usDebtPerCapita: 107578,
    usFederalOutlaysTrillions: 6.9,
    usFederalRevenueTrillions: 4.92, // FY2024 federal tax receipts (~$4.92T)
    usDebtToRevenueRatio: 7.36, // $36.2T / $4.92T
    usNetInterestBillions: 1120, // ~$1.12T net interest
    usInterestPctOfOutlays: 16.2, // ~16.2% of federal budget
    usShortTermTBillSharePct: 31.8, // ~31.8% of marketable debt maturing < 12 months
    quincyInterestAndPrincipalPctOfBudget: 18.6, // $88.8M / $478.5M
    quincyUnfundedBanPlusDebtSchedulePct: 22.8, // Once $508M BANs are permanently amortized
    quincyShortTermBanSharePct: 31.4, // $508M / $1,618M comprehensive debt
    quincyDebtToRevenueRatio: 3.38, // $1,618M / $478.5M annual operating budget/revenues
  },
};
