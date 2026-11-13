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
    <>
      {/* =====================================================================
          INTRODUCTION SECTION
      ===================================================================== */}
      <section id="introduction" className="py-12 md:py-16 border-b border-stone-300 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <span className="text-xs font-mono text-slate-600">
              Sources: Quincy Office of Municipal Finance • MA DOR DLS Databank • US Treasury
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="fluid-hero-title font-serif font-bold text-slate-900 tracking-tight">
              The $1.62 Billion Tab: Inside Quincy’s Debt Machine
            </h1>

            <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal">
              Over the past decade, the City of Quincy has taken on one of the largest municipal
              borrowing loads in New England. By combining{' '}
              <strong className="font-semibold text-slate-900">
                $475M in loans to fund city pensions
              </strong>{' '}
              (Pension Obligation Bonds), over{' '}
              <strong className="font-semibold text-slate-900">
                $200M in downtown Quincy Center development loans
              </strong>{' '}
              (DIF), and roughly{' '}
              <strong className="font-semibold text-rose-800">
                $508M in short-term construction “bridge loans”
              </strong>{' '}
              (called BANs), the city’s total debt footprint now rivals far larger metropolitan
              budgets.
            </p>

            {/* Dual Framing: Rationale vs. Explicit Taxpayer Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-stone-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-800 font-bold mb-1.5">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  Why the City Borrowed
                </div>
                <p className="text-sm text-slate-700">
                  Revitalize downtown Quincy Center to attract new businesses and tax revenue,
                  modernize aging schools (Quincy High, Squantum Elementary), and lock in low 2021
                  interest rates to pay down the city’s pension obligations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-900 font-bold mb-1.5">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  The Risk to Taxpayers
                </div>
                <p className="text-sm text-rose-950">
                  Nearly <strong>$1 out of every $5 (18.6%)</strong> of Quincy’s annual budget now
                  goes toward paying off past debt and interest—and{' '}
                  <strong>$508M in short-term bridge loans</strong> still need to be locked into
                  long-term loans at today’s higher interest rates.
                </p>
              </div>
            </div>

            {/* Key Stat Strip */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-900 text-white">
                <dt className="text-xs font-mono uppercase text-slate-300">Total Debt Footprint</dt>
                <dd className="text-2xl font-mono font-bold text-amber-400 mt-1">$1.62B</dd>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Bonds + Pensions + Bridge Loans + DIF
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
              <div className="p-3.5 rounded-lg bg-civic-crimson text-paper-50">
                <dt className="text-xs font-mono uppercase text-paper-50/90 font-semibold">Share of Budget</dt>
                <dd className="text-2xl font-mono font-bold text-paper-50 mt-1">
                  {debtSharePct.toFixed(1)}%
                </dd>
                <span className="text-[11px] text-paper-50/90 font-medium block mt-0.5">
                  $88.8M of $478.5M budget
                </span>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STEP 1: YOUR HOUSEHOLD DEBT RECEIPT
      ===================================================================== */}
      <section id="step-1" className="py-14 md:py-20 border-b border-stone-300 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
              Step 1 • Your Household Debt Receipt
            </span>
            <h2 className="fluid-section-title font-serif font-bold text-slate-900">
              How Much of Your Property Tax Bill Goes to Paying Off Debt?
            </h2>
            <p className="mt-3 text-slate-700 text-base sm:text-lg">
              Before Quincy can pay for schools, police, fire, or repaving roads, roughly{' '}
              <strong>{debtSharePct.toFixed(1)} cents of every budget dollar</strong> goes straight
              to paying off principal and interest on past borrowing. Slide the bar below to match
              your annual property tax bill and see your household’s share.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Taxpayer Receipt Card */}
            <aside
              aria-label="Interactive Quincy Taxpayer Debt Receipt"
              className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6"
            >
              <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-4 flex items-center justify-between">
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-700" aria-hidden="true" />
                  Your Household Debt Receipt
                </h3>
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
                  <span>$6,680 (Quincy Avg Home)</span>
                  <span>$15,000 (2-Fam/Comm)</span>
                </div>
              </div>

              {/* Receipt Line Items */}
              <div className="space-y-2.5 font-mono text-sm">
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-700">1. Pension Loan Payments (POBs)</span>
                  <span className="font-bold text-slate-900">${userTaxGoingToPob.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-700">2. School, Road & Building Loans</span>
                  <span className="font-bold text-slate-900">
                    ${Math.round((userTaxGoingToDebt - userTaxGoingToPob) * 0.62).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-200">
                  <span className="text-slate-700">3. Bridge Loan Interest & Downtown DIF</span>
                  <span className="font-bold text-slate-900">
                    ${Math.round((userTaxGoingToDebt - userTaxGoingToPob) * 0.38).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 pb-2 bg-rose-50 px-3 rounded-lg border border-rose-200">
                  <div>
                    <span className="text-xs uppercase font-bold text-rose-900 block">
                      Total Going Toward Debt & Interest
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
            </aside>

            {/* Right Column: Visual Dollar Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-300 shadow-sm p-6 space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-600 block mb-1">
                  Big Picture • City Budget Split
                </span>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Where Every $1 of Quincy’s Operating Budget Goes
                </h3>
                <p className="text-sm text-slate-700 mt-1.5">
                  Out of Quincy’s <strong>$478.5M</strong> annual operating budget,{' '}
                  <strong>$88.8M (18.6%)</strong> is locked into paying down debt and interest,
                  leaving <strong>81.4%</strong> for everything else the city runs.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-700 mb-1.5">
                  <span>Operating Budget Breakdown</span>
                  <span className="font-bold text-rose-800">18.6% Debt Payments</span>
                </div>
                <div
                  className="h-6 w-full rounded-full overflow-hidden flex border border-slate-300"
                  role="img"
                  aria-label="Bar chart showing 18.6% of Quincy's budget goes to debt payments (7.8% pension loans, 10.8% capital and bridge loans) and 81.4% goes to schools, police, fire, DPW, and other city services."
                >
                  <div
                    style={{ width: '7.8%' }}
                    className="bg-amber-600 h-full"
                    title="Pension Loans (POB): 7.8%"
                  />
                  <div
                    style={{ width: '10.8%' }}
                    className="bg-rose-700 h-full"
                    title="School, Capital & Bridge Loans: 10.8%"
                  />
                  <div
                    style={{ width: '81.4%' }}
                    className="bg-slate-200 h-full"
                    title="All Other City Services (Schools, Police, Fire, DPW): 81.4%"
                  />
                </div>
                <div className="space-y-2 mt-4 text-xs font-mono text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-amber-600 inline-block" />
                      Pension Loan Payments (POBs)
                    </span>
                    <span className="font-bold text-slate-900">7.8% ($37.2M)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-rose-700 inline-block" />
                      School, Capital & Bridge Loans
                    </span>
                    <span className="font-bold text-slate-900">10.8% ($51.6M)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
                      Schools, Police, Fire, Roads & Services
                    </span>
                    <span className="font-bold text-slate-900">81.4% ($389.7M)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
