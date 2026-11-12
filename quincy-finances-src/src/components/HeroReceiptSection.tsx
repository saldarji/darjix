import React, { useState } from 'react';
import { QUINCY_HEADLINE_METRICS } from '../data/quincyFinancesData';
import { AlertTriangle, Building2, Calculator, DollarSign, FileText, ShieldAlert } from 'lucide-react';

export const HeroReceiptSection: React.FC = () => {
  const [householdTaxInput, setHouseholdTaxInput] = useState<number>(
    QUINCY_HEADLINE_METRICS.averageSingleFamilyTaxBill
  );

  const debtPerResident = Math.round(
    (QUINCY_HEADLINE_METRICS.comprehensiveDebtFootprintM * 1_000_000) /
      QUINCY_HEADLINE_METRICS.population
  );
  const debtPerHousehold = Math.round(
    (QUINCY_HEADLINE_METRICS.comprehensiveDebtFootprintM * 1_000_000) /
      QUINCY_HEADLINE_METRICS.households
  );

  const debtSharePct =
    (QUINCY_HEADLINE_METRICS.fy2025TotalDebtServiceM /
      QUINCY_HEADLINE_METRICS.fy2025OperatingBudgetM) *
    100;

  const userTaxGoingToDebt = Math.round(householdTaxInput * (debtSharePct / 100));
  const userTaxGoingToPob = Math.round(
    householdTaxInput *
      (QUINCY_HEADLINE_METRICS.annualPobDebtServiceM /
        QUINCY_HEADLINE_METRICS.fy2025OperatingBudgetM)
  );

  return (
    <section id="act-1" className="py-12 md:py-16 border-b border-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Kicker */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            Civic Finance Investigation • Quincy, MA
          </span>
          <span className="text-xs font-mono text-slate-600">
            Sources: Quincy Office of Municipal Finance • MA DOR DLS Databank • US Treasury
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Editorial Headline & Context */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="fluid-hero-title font-serif font-bold text-slate-900 tracking-tight">
              The $1.62 Billion Tab: Inside the City of Presidents’ Debt Machine
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
              Over the past decade, the City of Quincy has executed one of the most ambitious—and
              heavily leveraged—municipal financial strategies in New England. By combining{' '}
              <strong className="font-semibold text-slate-900">
                $475M in Pension Obligation Bonds
              </strong>
              , over{' '}
              <strong className="font-semibold text-slate-900">
                $200M in downtown Quincy Center District Improvement Financing (DIF)
              </strong>
              , and roughly{' '}
              <strong className="font-semibold text-rose-800">
                $508M in short-term Bond Anticipation Notes (BANs)
              </strong>
              , the city’s total debt footprint now rivals far larger metropolitan budgets.
            </p>

            {/* Dual Framing: Rationale vs. Explicit Taxpayer Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-stone-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-800 font-bold mb-1.5">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  The City’s Strategic Rationale
                </div>
                <p className="text-sm text-slate-700">
                  Revitalize downtown Quincy Center to grow the commercial tax base, modernize aging
                  schools (Quincy High, Squantum Elementary), and lock in 2021 low interest rates to
                  fund the city’s pension system.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-900 font-bold mb-1.5">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  Explicit Taxpayer Risk Exposure
                </div>
                <p className="text-sm text-rose-950">
                  Nearly <strong>$1 out of every $5 (18.6%)</strong> of Quincy’s operating budget is
                  now consumed by debt service—and <strong>$508M in short-term BANs</strong> must still
                  be refinanced into long-term bonds at today’s higher interest rates.
                </p>
              </div>
            </div>

            {/* Key Stat Strip */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-900 text-white">
                <dt className="text-xs font-mono uppercase text-slate-300">Total Exposure</dt>
                <dd className="text-2xl font-mono font-bold text-amber-400 mt-1">$1.62B</dd>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Bonds + POBs + BANs + DIF
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-stone-300">
                <dt className="text-xs font-mono uppercase text-slate-600">Per Resident</dt>
                <dd className="text-2xl font-mono font-bold text-slate-900 mt-1">
                  ${debtPerResident.toLocaleString()}
                </dd>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  101,636 residents
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-stone-300">
                <dt className="text-xs font-mono uppercase text-slate-600">Per Household</dt>
                <dd className="text-2xl font-mono font-bold text-slate-900 mt-1">
                  ${debtPerHousehold.toLocaleString()}
                </dd>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  ~44,800 households
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-rose-900 text-white">
                <dt className="text-xs font-mono uppercase text-rose-200">Budget Bite</dt>
                <dd className="text-2xl font-mono font-bold text-white mt-1">
                  {debtSharePct.toFixed(1)}%
                </dd>
                <span className="text-[11px] text-rose-200 block mt-0.5">
                  $88.8M of $478.5M budget
                </span>
              </div>
            </dl>
          </div>

          {/* Right Column: Interactive Taxpayer Receipt */}
          <aside
            aria-label="Interactive Quincy Taxpayer Debt Receipt"
            className="lg:col-span-5 bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6"
          >
            <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500 block">
                  City of Quincy • Annual Tax Allocation
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-700" aria-hidden="true" />
                  Your Household Debt Receipt
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs font-semibold rounded">
                FY2025–2026
              </span>
            </div>

            {/* Interactive Tax Bill Slider */}
            <div className="mb-5 bg-stone-100 p-4 rounded-xl border border-stone-200">
              <div className="flex justify-between items-baseline mb-2">
                <label
                  htmlFor="tax-bill-slider"
                  className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
                  Enter Your Annual Property Tax Bill:
                </label>
                <span className="text-lg font-mono font-bold text-slate-900">
                  ${householdTaxInput.toLocaleString()}/yr
                </span>
              </div>
              <input
                id="tax-bill-slider"
                type="range"
                min={3000}
                max={15000}
                step={100}
                value={householdTaxInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHouseholdTaxInput(val);
                  const pct = ((val - 3000) / (15000 - 3000)) * 100;
                  e.currentTarget.style.setProperty('--progress', `${pct}%`);
                }}
                style={{ '--progress': `${((householdTaxInput - 3000) / 12000) * 100}%` } as React.CSSProperties}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-600 mt-1">
                <span>$3,000 (Condo)</span>
                <span>$6,680 (Quincy Avg SFH)</span>
                <span>$15,000 (2-Fam/Comm)</span>
              </div>
            </div>

            {/* Receipt Line Items */}
            <div className="space-y-2.5 font-mono text-sm">
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-slate-700">1. Pension Obligation Bonds (POB)</span>
                <span className="font-bold text-slate-900">${userTaxGoingToPob.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-slate-700">2. General Capital & School Bonds</span>
                <span className="font-bold text-slate-900">
                  ${Math.round((userTaxGoingToDebt - userTaxGoingToPob) * 0.62).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-slate-700">3. Short-Term BAN Interest & DIF</span>
                <span className="font-bold text-slate-900">
                  ${Math.round((userTaxGoingToDebt - userTaxGoingToPob) * 0.38).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 pb-2 bg-rose-50 px-3 rounded-lg border border-rose-200">
                <div>
                  <span className="text-xs uppercase font-bold text-rose-900 block">
                    Total Going Directly to Debt Service
                  </span>
                  <span className="text-[11px] text-rose-800">
                    ({debtSharePct.toFixed(1)}¢ of every tax dollar before city services)
                  </span>
                </div>
                <span className="text-xl font-bold text-rose-800">
                  ${userTaxGoingToDebt.toLocaleString()}/yr
                </span>
              </div>
            </div>

            {/* Visual Dollar Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5">
                <span>Where Every $1 of Quincy’s Operating Budget Goes</span>
                <span className="font-bold text-rose-800">18.6% Debt Service</span>
              </div>
              <div
                className="h-4 w-full rounded-full overflow-hidden flex border border-slate-300"
                role="img"
                aria-label="Bar chart showing 18.6% of Quincy's budget goes to debt service (7.8% POBs, 10.8% capital/BAN debt) and 81.4% goes to schools, police, fire, DPW, and other city services."
              >
                <div
                  style={{ width: '7.8%' }}
                  className="bg-amber-600 h-full"
                  title="Pension Bonds (POB): 7.8%"
                />
                <div
                  style={{ width: '10.8%' }}
                  className="bg-rose-700 h-full"
                  title="Capital Bonds & BANs: 10.8%"
                />
                <div
                  style={{ width: '81.4%' }}
                  className="bg-slate-200 h-full"
                  title="All Other City Services (Schools, Police, Fire, DPW): 81.4%"
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-mono text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" />
                  7.8% Pension Bonds
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-700 inline-block" />
                  10.8% Capital & BAN Debt
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" />
                  81.4% Schools, Safety & Services
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
