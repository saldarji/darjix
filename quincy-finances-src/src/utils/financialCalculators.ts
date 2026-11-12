import { QUINCY_HEADLINE_METRICS, US_TREASURY_BENCHMARKS } from '../data/quincyFinancesData';

export interface BanRefinanceSimulationResult {
  principalConvertedM: number;
  termYears: number;
  interestRatePct: number;
  baseline2021RatePct: number;
  annualDebtServiceM: number;
  baselineAnnualDebtServiceM: number;
  extraAnnualCostVs2021M: number;
  totalLifetimePaymentsM: number;
  totalLifetimeInterestM: number;
  baselineLifetimeInterestM: number;
  extraLifetimeInterestVs2021M: number;
  newBudgetSharePct: number;
  extraCostPerHouseholdPerYear: number;
  extraCostPerHouseholdLifetime: number;
  opportunityCosts: {
    teachersEquivalent: number;
    firefightersEquivalent: number;
    roadMilesEquivalent: number;
  };
}

/**
 * Standard level-debt-service annuity formula for converting short-term BANs into long-term municipal bonds
 */
export function calculateAnnualAmortizationM(
  principalM: number,
  annualRatePct: number,
  termYears: number
): number {
  if (annualRatePct <= 0) return principalM / termYears;
  const r = annualRatePct / 100;
  const factor = (r * Math.pow(1 + r, termYears)) / (Math.pow(1 + r, termYears) - 1);
  return principalM * factor;
}

export function simulateBanRefinancing(
  principalM: number,
  interestRatePct: number,
  termYears: number,
  baseline2021RatePct = 2.15
): BanRefinanceSimulationResult {
  const annualDebtServiceM = calculateAnnualAmortizationM(principalM, interestRatePct, termYears);
  const baselineAnnualDebtServiceM = calculateAnnualAmortizationM(
    principalM,
    baseline2021RatePct,
    termYears
  );

  const extraAnnualCostVs2021M = annualDebtServiceM - baselineAnnualDebtServiceM;
  const totalLifetimePaymentsM = annualDebtServiceM * termYears;
  const totalLifetimeInterestM = totalLifetimePaymentsM - principalM;

  const baselineLifetimePaymentsM = baselineAnnualDebtServiceM * termYears;
  const baselineLifetimeInterestM = baselineLifetimePaymentsM - principalM;
  const extraLifetimeInterestVs2021M = totalLifetimeInterestM - baselineLifetimeInterestM;

  // Current annual debt service ($88.8M) includes ~15M of existing BAN interest/paydowns,
  // so adding permanent amortization of $508M replaces ~$15M and adds the net new payment
  const netAdditionalBudgetLoadM = Math.max(0, annualDebtServiceM - 15.0);
  const projectedTotalDebtServiceM =
    QUINCY_HEADLINE_METRICS.fy2025TotalDebtServiceM + netAdditionalBudgetLoadM;
  const newBudgetSharePct =
    (projectedTotalDebtServiceM / QUINCY_HEADLINE_METRICS.fy2025OperatingBudgetM) * 100;

  const extraAnnualDollars = extraAnnualCostVs2021M * 1_000_000;
  const extraCostPerHouseholdPerYear =
    extraAnnualDollars / QUINCY_HEADLINE_METRICS.households;
  const extraCostPerHouseholdLifetime = extraCostPerHouseholdPerYear * termYears;

  const unitCosts = US_TREASURY_BENCHMARKS.opportunityCostUnitCosts;

  return {
    principalConvertedM: principalM,
    termYears,
    interestRatePct,
    baseline2021RatePct,
    annualDebtServiceM,
    baselineAnnualDebtServiceM,
    extraAnnualCostVs2021M,
    totalLifetimePaymentsM,
    totalLifetimeInterestM,
    baselineLifetimeInterestM,
    extraLifetimeInterestVs2021M,
    newBudgetSharePct,
    extraCostPerHouseholdPerYear,
    extraCostPerHouseholdLifetime,
    opportunityCosts: {
      teachersEquivalent: Math.round(
        Math.max(0, extraAnnualDollars) / unitCosts.publicSchoolTeacherSalaryAndBenefits
      ),
      firefightersEquivalent: Math.round(
        Math.max(0, extraAnnualDollars) / unitCosts.firefighterPoliceOfficerFullCost
      ),
      roadMilesEquivalent: Number(
        (Math.max(0, extraAnnualDollars) / unitCosts.mileOfRoadRepavingCost).toFixed(1)
      ),
    },
  };
}

export interface DifBreakevenSimulationResult {
  difDebtTotalM: number;
  difBondRatePct: number;
  commercialGrowthRatePct: number;
  occupancyFactorPct: number;
  requiredAnnualDifDebtServiceM: number;
  projectedAnnualIncrementalTaxRevenueM: number;
  annualSurplusOrShortfallM: number; // Negative means taxpayer subsidy required
  annualSubsidyPerHousehold: number;
  isSelfFunding: boolean;
  breakevenGrowthRateNeededPct: number;
}

/**
 * Simulates Quincy Center District Improvement Financing (DIF) self-funding vs. General Fund subsidy
 */
export function simulateQuincyCenterDif(
  commercialGrowthRatePct: number,
  difBondRatePct: number,
  occupancyFactorPct = 90
): DifBreakevenSimulationResult {
  const difDebtTotalM = QUINCY_HEADLINE_METRICS.quincyCenterDifExposureM; // $210M
  // 25-year amortization of the $210M total DIF debt footprint
  const requiredAnnualDifDebtServiceM = calculateAnnualAmortizationM(
    difDebtTotalM,
    difBondRatePct,
    25
  );

  // Baseline incremental downtown tax revenue (~$8.4M current run-rate before new growth/occupancy adjustments)
  const baseIncrementalTaxM = 8.4;
  // Compounded 5-year medium-term realization based on growth rate and occupancy
  const growthMultiplier = Math.pow(1 + commercialGrowthRatePct / 100, 5);
  const occupancyMultiplier = occupancyFactorPct / 92; // Normalized to 92% healthy stabilization
  const projectedAnnualIncrementalTaxRevenueM =
    baseIncrementalTaxM * growthMultiplier * occupancyMultiplier;

  const annualSurplusOrShortfallM =
    projectedAnnualIncrementalTaxRevenueM - requiredAnnualDifDebtServiceM;

  const annualSubsidyPerHousehold =
    annualSurplusOrShortfallM < 0
      ? (Math.abs(annualSurplusOrShortfallM) * 1_000_000) /
        QUINCY_HEADLINE_METRICS.households
      : 0;

  // Solve for growth rate r where base * (1+r)^5 * occMult = requiredAnnualDifDebtServiceM
  const targetRatio =
    requiredAnnualDifDebtServiceM / (baseIncrementalTaxM * occupancyMultiplier);
  const breakevenGrowthRateNeededPct =
    targetRatio > 1 ? (Math.pow(targetRatio, 1 / 5) - 1) * 100 : 0;

  return {
    difDebtTotalM,
    difBondRatePct,
    commercialGrowthRatePct,
    occupancyFactorPct,
    requiredAnnualDifDebtServiceM,
    projectedAnnualIncrementalTaxRevenueM,
    annualSurplusOrShortfallM,
    annualSubsidyPerHousehold,
    isSelfFunding: annualSurplusOrShortfallM >= 0,
    breakevenGrowthRateNeededPct,
  };
}

export interface PobArbitrageSimulationResult {
  assumedReturnPct: number;
  bondRatePct: number;
  annualLockedDebtServiceM: number;
  yearsSimulated: number;
  endingFundBalanceM: number;
  actuarialTargetBalanceM: number;
  netSurplusOrUnfundedLiabilityM: number; // Negative means new unfunded liability on top of bond payment
  yearByYearTrajectory: Array<{
    year: number;
    bondPaymentM: number;
    simulatedAssetValueM: number;
    targetAssetValueM: number;
    cumulativeNetGainLossM: number;
  }>;
}

/**
 * Simulates the $475M Pension Obligation Bond (POB) arbitrage gamble from 2022 to 2040 (18 years)
 */
export function simulatePobArbitrage(assumedReturnPct: number): PobArbitrageSimulationResult {
  const initialProceedsM = 475.0;
  const bondRatePct = 2.89;
  const actuarialTargetRatePct = 7.0; // Typical PERAC actuarial target discount rate
  const annualLockedDebtServiceM = 37.2;
  const yearsSimulated = 18; // 2022 -> 2040

  let simulatedAssetValueM = initialProceedsM;
  let targetAssetValueM = initialProceedsM;
  // Assume ~5.2% annual benefit payout outflow from the POB proceeds tranche
  const annualBenefitOutflowRate = 0.052;

  const yearByYearTrajectory = [];

  for (let i = 1; i <= yearsSimulated; i++) {
    const year = 2022 + i;
    simulatedAssetValueM =
      simulatedAssetValueM * (1 + assumedReturnPct / 100 - annualBenefitOutflowRate);
    targetAssetValueM =
      targetAssetValueM * (1 + actuarialTargetRatePct / 100 - annualBenefitOutflowRate);

    // Compare against the counterfactual of paying the bond rate (2.89%)
    const bondCostBenchmarkM =
      initialProceedsM * Math.pow(1 + bondRatePct / 100 - annualBenefitOutflowRate, i);

    yearByYearTrajectory.push({
      year,
      bondPaymentM: annualLockedDebtServiceM,
      simulatedAssetValueM: Number(simulatedAssetValueM.toFixed(1)),
      targetAssetValueM: Number(targetAssetValueM.toFixed(1)),
      cumulativeNetGainLossM: Number((simulatedAssetValueM - bondCostBenchmarkM).toFixed(1)),
    });
  }

  const netSurplusOrUnfundedLiabilityM = simulatedAssetValueM - targetAssetValueM;

  return {
    assumedReturnPct,
    bondRatePct,
    annualLockedDebtServiceM,
    yearsSimulated,
    endingFundBalanceM: Number(simulatedAssetValueM.toFixed(1)),
    actuarialTargetBalanceM: Number(targetAssetValueM.toFixed(1)),
    netSurplusOrUnfundedLiabilityM: Number(netSurplusOrUnfundedLiabilityM.toFixed(1)),
    yearByYearTrajectory,
  };
}
