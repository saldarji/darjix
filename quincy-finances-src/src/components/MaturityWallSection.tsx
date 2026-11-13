import React, { useState } from 'react';
import { QUINCY_MATURITY_SCHEDULE } from '../data/quincyFinancesData';
import { calculateAnnualAmortizationM } from '../utils/financialCalculators';
import { CalendarClock, Eye, EyeOff, Flame, Info } from 'lucide-react';

export const MaturityWallSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'scheduled-only' | 'ban-cliff' | 'amortized-projection'>(
    'amortized-projection'
  );
  const [assumedRefiRate, setAssumedRefiRate] = useState<number>(4.25);

  // If the $508M in short-term BANs are converted into 25-year bonds starting FY2026:
  const annualBanConversionDebtServiceM = calculateAnnualAmortizationM(508, assumedRefiRate, 25);

  return (
    <section id="step-3" className="py-14 md:py-20 border-b border-stone-300 scroll-mt-28 cv-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Step 3 • When the Bills Come Due (FY2025–FY2045)
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            When the Bills Come Due: The $508M Short-Term Loan “Cliff”
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-8">
            <p className="text-slate-700 text-base sm:text-lg">
              Typical city debt charts only show <em>already locked-in</em> long-term loans, which
              makes future payments look like they steadily shrink. That view leaves out{' '}
              <strong className="text-rose-800">~$508M in short-term bridge loans (BANs)</strong>{' '}
              that come due within 12–18 months and must be renewed or converted into permanent
              25-year loans.
            </p>
          </div>

          {/* Interactive View Switcher */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-600">
              Select Maturity Visualization Mode:
            </span>
            <div className="grid grid-cols-1 gap-1.5 bg-stone-200/80 p-1.5 rounded-xl border border-stone-300">
              <button
                type="button"
                onClick={() => setViewMode('amortized-projection')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold text-left flex items-center justify-between transition-all ${
                  viewMode === 'amortized-projection'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-800 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  1. Realistic: Bonded Debt + Amortized BANs
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-civic-crimson text-slate-900 font-bold">
                  +${annualBanConversionDebtServiceM.toFixed(1)}M/yr
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('ban-cliff')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold text-left flex items-center justify-between transition-all ${
                  viewMode === 'ban-cliff'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-800 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                  2. Raw Contractual Maturity ($508M BAN Wall)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('scheduled-only')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold text-left flex items-center justify-between transition-all ${
                  viewMode === 'scheduled-only'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-800 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  3. Official Bonded Only (Hides $508M BANs)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-stone-200">
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-rose-700" aria-hidden="true" />
                {viewMode === 'amortized-projection' &&
                  `Annual Debt Service Schedule Including 25-Year Takeout of $508M BANs (at ${assumedRefiRate}%)`}
                {viewMode === 'ban-cliff' &&
                  'Raw Contractual Maturity Wall: Showing $508M in Short-Term Notes Maturing FY25–FY26'}
                {viewMode === 'scheduled-only' &&
                  'Long-Term Bonded Debt Service Only (Excludes $508M Short-Term BANs)'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Notice how the orange Pension Obligation Bond ($37.2M/yr) locks in a rigid floor
                every single year until a sharp drop-off in FY2040.
              </p>
            </div>

            {viewMode === 'amortized-projection' && (
              <div className="flex items-center gap-3 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
                <label
                  htmlFor="quick-ban-rate"
                  className="text-xs font-mono font-semibold text-rose-950"
                >
                  Assumed BAN-to-Bond Rate: <strong>{assumedRefiRate.toFixed(2)}%</strong>
                </label>
                <input
                  id="quick-ban-rate"
                  type="range"
                  min={2.0}
                  max={6.5}
                  step={0.25}
                  value={assumedRefiRate}
                  onChange={(e) => setAssumedRefiRate(Number(e.target.value))}
                  className="w-28 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-700 inline-block" />
              Core Capital & Enterprise Bonds (P&I)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              Pension Obligation Bonds ($37.2M/yr through 2040)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-700 inline-block" />
              Quincy Center DIF Bonds
            </span>
            {viewMode !== 'scheduled-only' && (
              <span className="inline-flex items-center gap-1.5 font-bold text-rose-800">
                <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
                {viewMode === 'ban-cliff'
                  ? 'Short-Term BAN Rollover Cliff ($508M Total)'
                  : `Refinanced $508M BANs (+$${annualBanConversionDebtServiceM.toFixed(1)}M/yr)`}
              </span>
            )}
          </div>

          {/* Interactive Bar Chart (FY2025 - FY2045) */}
          {(() => {
            const maxScaleM = viewMode === 'ban-cliff' ? 420 : 140;
            const yAxisTicks = [1, 0.75, 0.5, 0.25, 0].map((frac) =>
              Math.round(maxScaleM * frac)
            );

            return (
              <div
                className="bg-stone-50 rounded-xl border border-stone-200 px-3 sm:px-4 pb-3 pt-2 overflow-x-auto"
                role="img"
                aria-label="Stacked bar chart of Quincy's annual debt service from FY2025 to FY2045 across Capital Bonds, Pension Bonds, DIF, and Short-Term BAN refinancing."
              >
                <div className="min-w-[680px] pt-8">
                  <div className="flex items-stretch">
                    {/* Y-Axis Scale Labels */}
                    <div
                      aria-hidden="true"
                      className="w-12 shrink-0 h-56 flex flex-col justify-between items-end pr-2.5 text-[10px] font-mono text-slate-500 select-none"
                    >
                      {yAxisTicks.map((tick) => (
                        <span key={tick} className="leading-none -translate-y-1/2 first:translate-y-0 last:translate-y-1/2">
                          ${tick}M
                        </span>
                      ))}
                    </div>

                    {/* Plot Area: Gridlines + 21 Stacked Columns */}
                    <div className="flex-1 relative h-56">
                      {/* Horizontal Gridlines */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                      >
                        {yAxisTicks.map((tick, i) => (
                          <div
                            key={tick}
                            className={`w-full ${
                              i === yAxisTicks.length - 1
                                ? 'border-b border-slate-400'
                                : 'border-t border-dashed border-stone-300/80'
                            }`}
                          />
                        ))}
                      </div>

                      {/* 21 Vertical Bar Columns */}
                      <div className="relative z-10 flex items-end gap-1 sm:gap-1.5 h-full px-1">
                        {QUINCY_MATURITY_SCHEDULE.map((row, idx) => {
                          const coreCapitalM =
                            row.goBondPrincipalM + row.goBondInterestM + row.enterpriseDebtServiceM;
                          const pobM = row.pobPrincipalM + row.pobInterestM;
                          const difM = row.difDebtServiceM;
                          const banOverlayM =
                            viewMode === 'ban-cliff'
                              ? row.shortTermBanMaturityM
                              : viewMode === 'amortized-projection' && row.fiscalYear >= 2026
                              ? annualBanConversionDebtServiceM
                              : 0;

                          const totalBarM = coreCapitalM + pobM + difM + banOverlayM;
                          const totalHeightPct = Math.min(100, (totalBarM / maxScaleM) * 100);

                          const banPctOfBar = totalBarM > 0 ? (banOverlayM / totalBarM) * 100 : 0;
                          const difPctOfBar = totalBarM > 0 ? (difM / totalBarM) * 100 : 0;
                          const pobPctOfBar = totalBarM > 0 ? (pobM / totalBarM) * 100 : 0;
                          const corePctOfBar = totalBarM > 0 ? (coreCapitalM / totalBarM) * 100 : 0;

                          const tooltipAlignClass =
                            idx <= 1
                              ? 'left-0'
                              : idx >= QUINCY_MATURITY_SCHEDULE.length - 2
                              ? 'right-0'
                              : 'left-1/2 -translate-x-1/2';

                          return (
                            <div
                              key={row.fiscalYear}
                              className="flex-1 min-w-0 h-full flex flex-col justify-end items-center group relative"
                            >
                              {/* Hover Tooltip */}
                              <div
                                className={`opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-7 ${tooltipAlignClass} z-20 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow whitespace-nowrap`}
                              >
                                FY{String(row.fiscalYear).slice(2)}: ${totalBarM.toFixed(1)}M
                              </div>

                              {/* Stacked Bar */}
                              <div
                                style={{ height: `${totalHeightPct}%` }}
                                className="w-full max-w-[32px] flex flex-col rounded-t overflow-hidden transition-all duration-300 shadow-sm group-hover:brightness-110"
                              >
                                {banOverlayM > 0 && (
                                  <div
                                    style={{ height: `${banPctOfBar}%` }}
                                    className="w-full bg-rose-600 border-b border-white/25 transition-all duration-300"
                                    title={`FY${row.fiscalYear} BAN Refinancing / Rollover: $${banOverlayM.toFixed(1)}M`}
                                  />
                                )}
                                {difM > 0 && (
                                  <div
                                    style={{ height: `${difPctOfBar}%` }}
                                    className="w-full bg-teal-700 border-b border-white/25 transition-all duration-300"
                                    title={`FY${row.fiscalYear} DIF Debt Service: $${difM.toFixed(1)}M`}
                                  />
                                )}
                                {pobM > 0 && (
                                  <div
                                    style={{ height: `${pobPctOfBar}%` }}
                                    className="w-full bg-amber-500 border-b border-white/25 transition-all duration-300"
                                    title={`FY${row.fiscalYear} Pension Bonds (POB): $${pobM.toFixed(1)}M`}
                                  />
                                )}
                                {coreCapitalM > 0 && (
                                  <div
                                    style={{ height: `${corePctOfBar}%` }}
                                    className="w-full bg-blue-700 transition-all duration-300"
                                    title={`FY${row.fiscalYear} Core Capital & Enterprise: $${coreCapitalM.toFixed(1)}M`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Year Labels */}
                  <div className="flex items-center mt-2">
                    <div className="w-12 shrink-0" aria-hidden="true" />
                    <div className="flex-1 flex gap-1 sm:gap-1.5 px-1">
                      {QUINCY_MATURITY_SCHEDULE.map((row) => (
                        <span
                          key={row.fiscalYear}
                          className="flex-1 min-w-0 text-center text-[10px] font-mono text-slate-600"
                        >
                          ’{String(row.fiscalYear).slice(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Annotation Callouts Under Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-mono uppercase font-bold text-rose-900 block">
                2025–2026: The $508M Rollover Wall
              </span>
              <p className="text-xs sm:text-sm text-rose-950 mt-1">
                Converting $508M of short-term notes into 25-year bonds at{' '}
                <strong>{assumedRefiRate}%</strong> adds{' '}
                <strong>${annualBanConversionDebtServiceM.toFixed(1)}M per year</strong> in permanent
                annual debt service—pushing Quincy’s peak annual debt bill past{' '}
                <strong>${(88.8 + annualBanConversionDebtServiceM - 15).toFixed(1)}M/year</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-mono uppercase font-bold text-amber-900 block">
                2025–2039: The 15-Year POB Plateau
              </span>
              <p className="text-xs sm:text-sm text-amber-950 mt-1">
                The yellow band ($37.2M/yr) does not decline for the next 15 years. Even if property
                tax growth slows or state aid is cut, Quincy must legally wire $37.2M to pension
                bondholders every year through FY2039.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-100 border border-stone-300">
              <span className="text-xs font-mono uppercase font-bold text-slate-800 block">
                FY2040–2041: The Pension Bond Drop-Off
              </span>
              <p className="text-xs sm:text-sm text-slate-700 mt-1">
                Relief finally arrives in FY2040–2041 when the 2021 Pension Obligation Bonds mature—
                assuming pension investment returns hit their ~7.0% target and haven't created a new
                unfunded liability in the meantime.
              </p>
            </div>
          </div>
        </div>

        {/* Accessible Table Disclosure */}
        <details className="methodology-drawer bg-white rounded-xl border border-stone-300 p-4 mt-6">
          <summary className="cursor-pointer font-mono text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700" aria-hidden="true" />
              View Year-by-Year Debt Service Table (FY2025–FY2045 in $ Millions)
            </span>
          </summary>
          <div className="mt-4 overflow-x-auto max-h-80">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-slate-300 uppercase text-slate-600 bg-stone-50 sticky top-0">
                  <th className="py-2 px-3">Fiscal Year</th>
                  <th className="py-2 px-3 text-right">Core GO + Enterprise ($M)</th>
                  <th className="py-2 px-3 text-right">Pension Bonds POB ($M)</th>
                  <th className="py-2 px-3 text-right">Quincy Center DIF ($M)</th>
                  <th className="py-2 px-3 text-right">Refinanced BAN Add-On ($M)</th>
                  <th className="py-2 px-3 text-right">Total Projected ($M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {QUINCY_MATURITY_SCHEDULE.map((r) => {
                  const core = r.goBondPrincipalM + r.goBondInterestM + r.enterpriseDebtServiceM;
                  const pob = r.pobPrincipalM + r.pobInterestM;
                  const banAdd = r.fiscalYear >= 2026 ? annualBanConversionDebtServiceM : 0;
                  const tot = core + pob + r.difDebtServiceM + banAdd;
                  return (
                    <tr key={r.fiscalYear} className="hover:bg-stone-50">
                      <td className="py-1.5 px-3 font-bold">FY{r.fiscalYear}</td>
                      <td className="py-1.5 px-3 text-right">${core.toFixed(1)}M</td>
                      <td className="py-1.5 px-3 text-right text-amber-800">${pob.toFixed(1)}M</td>
                      <td className="py-1.5 px-3 text-right text-teal-800">
                        ${r.difDebtServiceM.toFixed(1)}M
                      </td>
                      <td className="py-1.5 px-3 text-right text-rose-800">
                        ${banAdd.toFixed(1)}M
                      </td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                        ${tot.toFixed(1)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
};
