import React, { useState } from 'react';
import { US_TREASURY_BENCHMARKS } from '../data/quincyFinancesData';
import {
  simulateBanRefinancing,
  simulateQuincyCenterDif,
  simulatePobArbitrage,
} from '../utils/financialCalculators';
import {
  AlertTriangle,
  Building,
  Flame,
  GraduationCap,
  Landmark,
  Sliders,
  TrendingUp,
  Truck,
} from 'lucide-react';

export const RiskSimulatorsSection: React.FC = () => {
  // Simulator A State: T-Bill & BAN Refinancing
  const [selectedPresetId, setSelectedPresetId] = useState<string>('current-market');
  const [banRefiRate, setBanRefiRate] = useState<number>(4.15);
  const [tBillReferenceRate, setTBillReferenceRate] = useState<number>(4.30);
  const [amortizationYears, setAmortizationYears] = useState<number>(25);
  const [banPrincipalToBondM, setBanPrincipalToBondM] = useState<number>(508);

  // Simulator B State: Quincy Center DIF Breakeven
  const [difGrowthRate, setDifGrowthRate] = useState<number>(2.5);
  const [difOccupancyPct, setDifOccupancyPct] = useState<number>(88);

  // Simulator C State: $475M Pension Bond Arbitrage
  const [pobMarketReturn, setPobMarketReturn] = useState<number>(6.2);

  const banSim = simulateBanRefinancing(banPrincipalToBondM, banRefiRate, amortizationYears, 2.15);
  const difSim = simulateQuincyCenterDif(difGrowthRate, banRefiRate, difOccupancyPct);
  const pobSim = simulatePobArbitrage(pobMarketReturn);

  const handlePresetClick = (preset: (typeof US_TREASURY_BENCHMARKS.presets)[number]) => {
    setSelectedPresetId(preset.id);
    setTBillReferenceRate(preset.tBill1YrRate);
    setBanRefiRate(preset.muniBondRefiRate);
  };

  return (
    <section id="step-4" className="py-14 md:py-20 border-b border-stone-300 scroll-mt-28 cv-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Step 4 • Interactive Taxpayer Risk Lab (3 Live Simulators)
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            Test Quincy’s Budget: Interest Rates, Downtown Growth & Pension Returns
          </h2>
          <p className="mt-3 text-slate-700 text-base sm:text-lg">
            Because Quincy relies heavily on renewing short-term bridge loans, betting on new
            downtown tax revenue, and investing borrowed money for pensions, future tax bills depend
            on market forces the city cannot control. Use the three calculators below to see how
            changes affect taxpayers.
          </p>
        </div>

        {/* =====================================================================
            SIMULATOR A: T-BILL & BAN REFINANCING SIMULATOR
        ===================================================================== */}
        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] overflow-hidden mb-12">
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                Simulator A • Short-Term BAN-to-Bond Takeout Calculator
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" aria-hidden="true" />
                Set the US T-Bill / Municipal Bond Financing Rate
              </h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-slate-300 block">1-Yr US T-Bill Benchmark</span>
              <span className="text-lg font-bold text-amber-400">{tBillReferenceRate.toFixed(2)}%</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* Rate Regime Presets */}
              <div>
                <span className="text-xs font-mono uppercase font-bold text-slate-700 block mb-2">
                  1. Choose a US Treasury / Macro Interest Rate Regime:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {US_TREASURY_BENCHMARKS.presets.map((preset) => {
                    const active = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-stone-50 text-slate-900 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs font-bold">
                          <span>{preset.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] ${
                              active ? 'bg-white/20 text-white' : 'bg-stone-200 text-slate-800'
                            }`}
                          >
                            {preset.muniBondRefiRate}%
                          </span>
                        </div>
                        <span
                          className={`text-[11px] block mt-1 ${
                            active ? 'text-rose-100' : 'text-slate-600'
                          }`}
                        >
                          T-Bill: {preset.tBill1YrRate}% • {preset.sublabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Municipal Financing Rate Slider */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                <div className="flex justify-between items-baseline mb-1.5">
                  <label
                    htmlFor="muni-refi-slider"
                    className="text-xs font-mono uppercase font-bold text-slate-800"
                  >
                    2. Fine-Tune Quincy’s Bond Refinancing Interest Rate:
                  </label>
                  <span className="text-xl font-mono font-bold text-rose-800">
                    {banRefiRate.toFixed(2)}%
                  </span>
                </div>
                <input
                  id="muni-refi-slider"
                  type="range"
                  min={1.5}
                  max={7.5}
                  step={0.05}
                  value={banRefiRate}
                  onChange={(e) => {
                    setSelectedPresetId('custom');
                    const val = Number(e.target.value);
                    setBanRefiRate(val);
                  }}
                  className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-1">
                  <span>1.50% (2021 Low)</span>
                  <span>4.15% (Current Muni AA)</span>
                  <span>7.50% (Severe Stress)</span>
                </div>
              </div>

              {/* Principal & Term Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
                  <div className="flex justify-between items-baseline mb-1">
                    <label
                      htmlFor="ban-principal-slider"
                      className="text-xs font-mono uppercase font-bold text-slate-700"
                    >
                      BANs to Permanently Bond:
                    </label>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      ${banPrincipalToBondM}M
                    </span>
                  </div>
                  <input
                    id="ban-principal-slider"
                    type="range"
                    min={200}
                    max={650}
                    step={10}
                    value={banPrincipalToBondM}
                    onChange={(e) => setBanPrincipalToBondM(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600">
                    <span>$200M Partial</span>
                    <span>$508M Current BANs</span>
                    <span>$650M w/ CIP</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
                  <span className="text-xs font-mono uppercase font-bold text-slate-700 block mb-2">
                    Bond Amortization Term:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[15, 20, 25, 30].slice(0, 3).map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setAmortizationYears(yr)}
                        className={`py-1.5 px-2 rounded font-mono text-xs font-bold border ${
                          amortizationYears === yr
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-800 border-stone-300'
                        }`}
                      >
                        {yr} Yrs
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmortizationYears(30)}
                    className={`w-full mt-1.5 py-1 px-2 rounded font-mono text-xs font-bold border ${
                      amortizationYears === 30
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-stone-300'
                    }`}
                  >
                    30 Years (Max Stretch)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Outputs: Lifetime Cost + Opportunity Cost Translator */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-stone-50 p-5 rounded-xl border border-stone-300">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-600 mb-3">
                  Simulated Impact of Bonding ${banPrincipalToBondM}M for {amortizationYears} Years at{' '}
                  {banRefiRate.toFixed(2)}%
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-xl bg-white border border-stone-300">
                    <span className="text-xs font-mono text-slate-600 block">
                      New Annual Payment (P&I)
                    </span>
                    <span className="text-2xl font-mono font-bold text-slate-900">
                      ${banSim.annualDebtServiceM.toFixed(1)}M/yr
                    </span>
                    <span className="text-[11px] font-mono text-rose-800 block mt-0.5">
                      {banSim.extraAnnualCostVs2021M >= 0 ? '+' : ''}
                      ${banSim.extraAnnualCostVs2021M.toFixed(1)}M/yr vs. 2021 rates (2.15%)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 text-white">
                    <span className="text-xs font-mono text-slate-300 block">
                      Total Lifetime Interest Paid
                    </span>
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      ${banSim.totalLifetimeInterestM.toFixed(0)}M
                    </span>
                    <span className="text-[11px] font-mono text-rose-300 block mt-0.5">
                      {banSim.extraLifetimeInterestVs2021M >= 0 ? '+' : ''}
                      ${banSim.extraLifetimeInterestVs2021M.toFixed(0)}M extra interest vs. 2021
                    </span>
                  </div>
                </div>

                {/* Principal vs Interest Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>
                      Total {amortizationYears}-Year Taxpayer Repayment:{' '}
                      <strong>${banSim.totalLifetimePaymentsM.toFixed(0)}M</strong>
                    </span>
                    <span className="text-rose-800 font-bold">
                      {Math.round(
                        (banSim.totalLifetimeInterestM / banSim.totalLifetimePaymentsM) * 100
                      )}
                      % is Pure Interest
                    </span>
                  </div>
                  <div className="h-5 w-full rounded-lg overflow-hidden flex border border-slate-300">
                    <div
                      style={{
                        width: `${
                          (banPrincipalToBondM / banSim.totalLifetimePaymentsM) * 100
                        }%`,
                      }}
                      className="bg-slate-800 text-white text-[10px] font-mono flex items-center justify-center"
                    >
                      Principal (${banPrincipalToBondM}M)
                    </div>
                    <div
                      style={{
                        width: `${
                          (banSim.totalLifetimeInterestM / banSim.totalLifetimePaymentsM) * 100
                        }%`,
                      }}
                      className="bg-rose-600 text-white text-[10px] font-mono flex items-center justify-center"
                    >
                      Interest (${banSim.totalLifetimeInterestM.toFixed(0)}M)
                    </div>
                  </div>
                </div>

                {/* Opportunity Cost Translator */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-950 block mb-2">
                    Civic Opportunity Cost: What the Extra +$
                    {Math.max(0, banSim.extraAnnualCostVs2021M).toFixed(1)}M/yr Rate Penalty Could Buy
                    Every Year:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                      <GraduationCap
                        className="w-5 h-5 text-amber-800 mx-auto mb-1"
                        aria-hidden="true"
                      />
                      <span className="text-lg font-mono font-bold text-slate-900 block">
                        {banSim.opportunityCosts.teachersEquivalent}
                      </span>
                      <span className="text-[11px] text-slate-700 leading-tight block">
                        Full-Time School Teachers
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                      <Flame className="w-5 h-5 text-rose-700 mx-auto mb-1" aria-hidden="true" />
                      <span className="text-lg font-mono font-bold text-slate-900 block">
                        {banSim.opportunityCosts.firefightersEquivalent}
                      </span>
                      <span className="text-[11px] text-slate-700 leading-tight block">
                        Firefighters / Police Officers
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                      <Truck className="w-5 h-5 text-blue-800 mx-auto mb-1" aria-hidden="true" />
                      <span className="text-lg font-mono font-bold text-slate-900 block">
                        {banSim.opportunityCosts.roadMilesEquivalent} mi
                      </span>
                      <span className="text-[11px] text-slate-700 leading-tight block">
                        Quincy Roads Repaved / Yr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-300 flex items-center justify-between text-xs font-mono text-slate-800">
                <span>Extra Cost Per Quincy Household (vs. 2.15% rate):</span>
                <strong className="text-rose-800 text-sm">
                  +${Math.round(Math.max(0, banSim.extraCostPerHouseholdPerYear))}/yr ($
                  {Math.round(Math.max(0, banSim.extraCostPerHouseholdLifetime)).toLocaleString()}{' '}
                  over {amortizationYears} yrs)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SIMULATOR B & SIMULATOR C SIDE-BY-SIDE
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SIMULATOR B: QUINCY CENTER DIF BREAKEVEN */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-900 text-white px-6 py-4">
                <span className="text-xs font-mono uppercase tracking-widest text-teal-400 block">
                  Simulator B • The “Quincy Center Bet” ($210M DIF Exposure)
                </span>
                <h3 className="text-xl font-serif font-bold flex items-center gap-2 mt-0.5">
                  <Building className="w-5 h-5 text-teal-400" aria-hidden="true" />
                  Will Downtown Commercial Growth Pay for Its Own Debt?
                </h3>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs sm:text-sm text-slate-700">
                  The city’s downtown financing plan (DIF) counts on new Quincy Center property taxes
                  to pay off ~$210M in garages and street upgrades. If new buildings or tenants lag
                  behind schedule, <strong>homeowners and businesses citywide must cover the shortfall</strong>.
                </p>

                <div className="space-y-4 bg-stone-100 p-4 rounded-xl border border-stone-200">
                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-1">
                      <label htmlFor="dif-growth-slider">
                        Annual Downtown Tax Increment Growth:
                      </label>
                      <span className="text-teal-900">{difGrowthRate.toFixed(1)}%/yr</span>
                    </div>
                    <input
                      id="dif-growth-slider"
                      type="range"
                      min={0.0}
                      max={8.0}
                      step={0.2}
                      value={difGrowthRate}
                      onChange={(e) => setDifGrowthRate(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-600">
                      <span>0.0% (Stalled)</span>
                      <span>
                        Breakeven Needed: {difSim.breakevenGrowthRateNeededPct.toFixed(1)}%/yr
                      </span>
                      <span>8.0% (Boom)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono font-bold mb-1">
                      <label htmlFor="dif-occupancy-slider">
                        Downtown Commercial / Retail Occupancy Rate:
                      </label>
                      <span className="text-teal-900">{difOccupancyPct}%</span>
                    </div>
                    <input
                      id="dif-occupancy-slider"
                      type="range"
                      min={65}
                      max={98}
                      step={1}
                      value={difOccupancyPct}
                      onChange={(e) => setDifOccupancyPct(Number(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-600">
                      <span>65% (Remote Work Slump)</span>
                      <span>88% (Baseline)</span>
                      <span>98% (Full Lease-Up)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[11px] text-slate-600 block">
                      Required DIF Debt Service
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      ${difSim.requiredAnnualDifDebtServiceM.toFixed(2)}M/yr
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      (at {banRefiRate.toFixed(2)}% bond rate)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[11px] text-slate-600 block">
                      Projected New DIF Tax Revenue
                    </span>
                    <span className="text-lg font-bold text-teal-800">
                      ${difSim.projectedAnnualIncrementalTaxRevenueM.toFixed(2)}M/yr
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      ({difGrowthRate}% growth, {difOccupancyPct}% occ.)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`px-6 py-4 border-t-2 flex items-center justify-between ${
                difSim.isSelfFunding
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div>
                <span className="text-xs font-mono uppercase font-bold block">
                  {difSim.isSelfFunding
                    ? 'Result: Downtown DIF Is Self-Funding'
                    : 'Taxpayer Risk Triggered: General Fund Subsidy Required'}
                </span>
                <span className="text-xs block mt-0.5">
                  {difSim.isSelfFunding
                    ? `Generates +$${difSim.annualSurplusOrShortfallM.toFixed(2)}M/yr surplus above DIF debt service.`
                    : `Residential taxpayers must subsidize $${Math.abs(
                        difSim.annualSurplusOrShortfallM
                      ).toFixed(2)}M/yr ($${Math.round(
                        difSim.annualSubsidyPerHousehold
                      )}/yr per household).`}
                </span>
              </div>
              <span className="text-xl font-mono font-bold">
                {difSim.isSelfFunding ? '+' : '-'}$
                {Math.abs(difSim.annualSurplusOrShortfallM).toFixed(2)}M
              </span>
            </div>
          </div>

          {/* SIMULATOR C: $475M PENSION BOND ARBITRAGE TRACKER */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-slate-900 text-white px-6 py-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                  Simulator C • The $475M Pension Obligation Bond (POB) Gamble
                </span>
                <h3 className="text-xl font-serif font-bold flex items-center gap-2 mt-0.5">
                  <TrendingUp className="w-5 h-5 text-amber-400" aria-hidden="true" />
                  Pension Market Returns vs. Locked-In $37.2M/Yr Bond Payments
                </h3>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs sm:text-sm text-slate-700">
                  Quincy borrowed $475M at ~2.89% interest in late 2021 to invest in the city pension
                  fund, aiming for a 7.0% annual return. Test what happens through 2040 if actual
                  investment returns fall short of that 7.0% target:
                </p>

                <div className="bg-stone-100 p-4 rounded-xl border border-stone-200">
                  <div className="flex justify-between text-xs font-mono font-bold mb-1">
                    <label htmlFor="pob-return-slider">
                      Actual Compounded Annual Pension Investment Return (2022–2040):
                    </label>
                    <span className="text-amber-900 text-base">{pobMarketReturn.toFixed(1)}%/yr</span>
                  </div>
                  <input
                    id="pob-return-slider"
                    type="range"
                    min={3.0}
                    max={9.0}
                    step={0.1}
                    value={pobMarketReturn}
                    onChange={(e) => setPobMarketReturn(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
                    <span>2.89% (Bond Interest Cost)</span>
                    <span>7.0% (Actuarial Target)</span>
                    <span>9.0% (Bull Market)</span>
                  </div>
                </div>

                {/* Mini Trajectory Visualization */}
                <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase text-slate-600 block">
                      Fixed Annual Bond Bill
                    </span>
                    <span className="text-lg font-bold text-slate-900">$37.2M/yr</span>
                    <span className="text-[10px] text-rose-800 block">Never drops if market falls</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase text-slate-600 block">
                      2040 Simulated Assets
                    </span>
                    <span className="text-lg font-bold text-amber-900">
                      ${pobSim.endingFundBalanceM.toFixed(0)}M
                    </span>
                    <span className="text-[10px] text-slate-600 block">
                      at {pobMarketReturn.toFixed(1)}% return
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase text-slate-600 block">
                      2040 Actuarial Target
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      ${pobSim.actuarialTargetBalanceM.toFixed(0)}M
                    </span>
                    <span className="text-[10px] text-slate-600 block">at 7.0% target</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`px-6 py-4 border-t-2 flex items-center justify-between ${
                pobSim.netSurplusOrUnfundedLiabilityM >= 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div>
                <span className="text-xs font-mono uppercase font-bold flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
                  {pobSim.netSurplusOrUnfundedLiabilityM >= 0
                    ? 'Actuarial Target Met or Exceeded'
                    : '“Double Whammy” Risk: New Unfunded Pension Gap'}
                </span>
                <span className="text-xs block mt-0.5">
                  {pobSim.netSurplusOrUnfundedLiabilityM >= 0
                    ? `Pension tranche finishes $${pobSim.netSurplusOrUnfundedLiabilityM.toFixed(0)}M ahead of the 7.0% actuarial schedule.`
                    : `Even after paying $37.2M/yr on the bonds, a ${pobMarketReturn}% return leaves a $${Math.abs(
                        pobSim.netSurplusOrUnfundedLiabilityM
                      ).toFixed(0)}M actuarial shortfall vs. the 7% target.`}
                </span>
              </div>
              <span className="text-xl font-mono font-bold">
                {pobSim.netSurplusOrUnfundedLiabilityM >= 0 ? '+' : '-'}$
                {Math.abs(pobSim.netSurplusOrUnfundedLiabilityM).toFixed(0)}M
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
