import React from 'react';
import { US_TREASURY_BENCHMARKS } from '../data/quincyFinancesData';
import { AlertOctagon, Globe2, Landmark, Printer, RefreshCw } from 'lucide-react';

export const NationalDebtComparisonSection: React.FC = () => {
  const macro = US_TREASURY_BENCHMARKS.usNationalDebtComparison;

  return (
    <section id="step-6" className="py-14 md:py-20 border-b border-stone-300 scroll-mt-28 cv-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Step 6 • Macro Perspective: Municipal Balance Sheet vs. Federal Treasury
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            Quincy vs. The $36 Trillion US National Debt: Who Spends More of Their Budget on Debt?
          </h2>
          <p className="mt-3 text-slate-700 text-base sm:text-lg">
            National headlines often warn that interest on the US National Debt has surged past
            defense spending to take up <strong>~16.2% of all federal spending</strong>. Yet when we
            put Quincy’s city budget side-by-side with Uncle Sam’s, two eye-opening comparisons stand
            out.
          </p>
        </div>

        {/* Two Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Card 1: The Budget Bite Speedometer */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold block">
                    Comparison 1 • The “Debt Service Bite”
                  </span>
                  <h3
                    className="text-xl font-serif font-bold text-slate-900 mt-0.5"
                    style={{ textWrap: 'balance' }}
                  >
                    Share of Annual Budget Consumed by Debt Service
                  </h3>
                </div>
                <Landmark className="w-7 h-7 text-slate-800 shrink-0 mt-1" aria-hidden="true" />
              </div>

              <p className="text-sm text-slate-700 mb-6">
                Even before locking in its $508M in short-term bridge loans, the City of Quincy
                spends a <strong>larger share of its operating budget</strong> paying off debt and
                interest than the US Federal Government spends on interest for the $36.2T national
                debt:
              </p>

              {/* Visual Bar Gauges */}
              <div className="space-y-5 font-mono">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">
                      US Federal Government (Net Interest / Outlays)
                    </span>
                    <span className="font-bold text-slate-900">
                      {macro.usInterestPctOfOutlays}% ($1.12T of $6.9T)
                    </span>
                  </div>
                  <div className="h-5 w-full bg-stone-200 rounded-lg overflow-hidden border border-stone-300">
                    <div
                      style={{ width: `${(macro.usInterestPctOfOutlays / 25) * 100}%` }}
                      className="h-full bg-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-rose-900">
                      City of Quincy Today (Bonded Debt + POBs / Budget)
                    </span>
                    <span className="font-bold text-rose-800">
                      {macro.quincyInterestAndPrincipalPctOfBudget}% ($88.8M of $478.5M)
                    </span>
                  </div>
                  <div className="h-5 w-full bg-stone-200 rounded-lg overflow-hidden border border-rose-300">
                    <div
                      style={{
                        width: `${(macro.quincyInterestAndPrincipalPctOfBudget / 25) * 100}%`,
                      }}
                      className="h-full bg-rose-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-900">
                      Quincy Pro-Forma (Once $508M BANs Are Bonded at ~4.15%)
                    </span>
                    <span className="font-bold text-amber-900">
                      ~{macro.quincyUnfundedBanPlusDebtSchedulePct}% of Current Budget
                    </span>
                  </div>
                  <div className="h-5 w-full bg-stone-200 rounded-lg overflow-hidden border border-amber-400">
                    <div
                      style={{
                        width: `${(macro.quincyUnfundedBanPlusDebtSchedulePct / 25) * 100}%`,
                      }}
                      className="h-full bg-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-slate-600">
              Note: Municipal debt service includes both scheduled principal paydown and interest
              (plus POB principal/interest), whereas the US Treasury rolls over principal
              indefinitely and budgets only net interest.
            </div>
          </div>

          {/* Card 2: The Short-Term Rollover Trap */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold block">
                    Comparison 2 • The Short-Term Maturity Trap
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    31% Short-Term Debt Rollover Exposure
                  </h3>
                </div>
                <RefreshCw className="w-7 h-7 text-rose-700 shrink-0" aria-hidden="true" />
              </div>

              <p className="text-sm text-slate-700 mb-6">
                Macroeconomists frequently criticize the US Treasury for financing roughly{' '}
                <strong>31.8% of US marketable debt in short-term T-Bills</strong> maturing within 12
                months. Remarkably, Quincy has replicated the exact same maturity structure at the
                local level:
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-stone-100 border border-stone-300 text-center">
                  <Globe2 className="w-6 h-6 text-slate-700 mx-auto mb-1.5" aria-hidden="true" />
                  <span className="text-xs font-mono uppercase text-slate-600 block">
                    US Treasury T-Bill Share
                  </span>
                  <span className="text-3xl font-mono font-bold text-slate-900 mt-1 block">
                    {macro.usShortTermTBillSharePct}%
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-1">
                    Maturing in &lt; 12 Months
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-center">
                  <AlertOctagon
                    className="w-6 h-6 text-rose-700 mx-auto mb-1.5"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-mono uppercase text-rose-900 font-bold block">
                    Quincy Short-Term BAN Share
                  </span>
                  <span className="text-3xl font-mono font-bold text-rose-800 mt-1 block">
                    {macro.quincyShortTermBanSharePct}%
                  </span>
                  <span className="text-[11px] text-rose-900 block mt-1">
                    $508M of $1.62B Footprint
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  The Crucial Difference: Quincy Has No Printing Press
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  The US Federal Government borrows in its own sovereign currency and is backed by
                  the Federal Reserve. The City of Quincy operates under{' '}
                  <strong>Massachusetts Proposition 2½</strong>: it cannot print money, and its annual
                  property tax levy growth is capped at 2.5% plus new growth—meaning every extra
                  dollar of BAN refinancing cost must come out of local taxpayers’ pockets or city
                  services.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between text-xs font-mono text-slate-700">
              <span>US National Debt Per Capita: $107,578</span>
              <span className="font-bold text-rose-800">
                Quincy Municipal Debt Per Capita: $15,919
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
