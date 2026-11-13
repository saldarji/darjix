import React, { useState } from 'react';
import { QUINCY_DEBT_BUCKETS, DebtBucket } from '../data/quincyFinancesData';
import { AlertCircle, CheckCircle2, Info, Layers, Scale } from 'lucide-react';

export const DebtAnatomySection: React.FC = () => {
  const [selectedBucket, setSelectedBucket] = useState<DebtBucket>(QUINCY_DEBT_BUCKETS[0]);

  return (
    <section id="step-2" className="py-14 md:py-20 border-b border-stone-300 scroll-mt-28 cv-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Step 2 • Anatomy of the Liabilities
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            Not All Municipal Debt Is Created Equal: The Four Pillars of Quincy’s $1.62B Footprint
          </h2>
          <p className="mt-3 text-slate-700 text-base sm:text-lg">
            In standard municipal finance, cities issue long-term fixed-rate bonds for schools, water
            mains, and roads. Quincy’s portfolio is unusual because{' '}
            <strong>more than 60% of its total debt footprint</strong> sits outside traditional capital
            bonds—split between short-term variable-rate notes (BANs) and speculative Pension
            Obligation Bonds (POBs).
          </p>
        </div>

        {/* Interactive Proportional Marimekko / Stacked Bar Selector */}
        <div className="bg-white p-6 rounded-2xl border border-stone-300 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-700" aria-hidden="true" />
              Click Any Segment Below to Inspect Rationale vs. Taxpayer Risk ($1,618M Total)
            </span>
            <span className="text-xs font-mono text-slate-600">
              Selected: <strong className="text-slate-900">{selectedBucket.name}</strong>
            </span>
          </div>

          {/* Interactive Proportional Bar */}
          <div
            className="h-16 w-full rounded-xl overflow-hidden flex border-2 border-slate-900 p-0.5 bg-slate-900 gap-0.5"
            role="group"
            aria-label="Proportional breakdown of Quincy's $1.618 Billion debt across 4 categories"
          >
            {QUINCY_DEBT_BUCKETS.map((bucket) => {
              const isSelected = selectedBucket.id === bucket.id;
              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => setSelectedBucket(bucket)}
                  style={{
                    width: `${bucket.sharePercent}%`,
                    backgroundColor: bucket.colorHex,
                  }}
                  className={`h-full relative flex flex-col justify-center px-3 text-left text-white transition-all overflow-hidden ${
                    isSelected
                      ? 'ring-4 ring-white z-10 brightness-110'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <span className="font-mono text-xs sm:text-sm font-bold truncate drop-shadow">
                    ${bucket.amountMillions}M ({bucket.sharePercent}%)
                  </span>
                  <span className="text-[11px] font-medium truncate opacity-95 hidden sm:block">
                    {bucket.shortName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bucket Selector Pills for Mobile & Quick Switching */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {QUINCY_DEBT_BUCKETS.map((bucket) => {
              const isSelected = selectedBucket.id === bucket.id;
              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => setSelectedBucket(bucket)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-stone-50 text-slate-900 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white/40"
                        style={{ backgroundColor: bucket.colorHex }}
                      />
                      {bucket.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        bucket.riskSeverity === 'Critical'
                          ? 'bg-rose-200 text-rose-950'
                          : bucket.riskSeverity === 'High'
                          ? 'bg-amber-200 text-amber-950'
                          : 'bg-blue-200 text-blue-950'
                      }`}
                    >
                      {bucket.riskSeverity} Risk
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-mono font-bold">${bucket.amountMillions}M</span>
                    <span
                      className={`text-xs font-mono ml-1.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      ({bucket.sharePercent}%)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Bucket Deep-Dive Card */}
        <article
          aria-live="polite"
          className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] overflow-hidden mb-10"
        >
          <div
            className="px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4"
            style={{ backgroundColor: selectedBucket.colorHex }}
          >
            <div>
              <span className="text-xs font-mono uppercase tracking-widest opacity-90 block">
                Selected Liability Category • {selectedBucket.interestType}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">{selectedBucket.name}</h3>
            </div>
            <div className="flex items-center gap-6 font-mono">
              <div>
                <span className="text-xs uppercase opacity-85 block">Principal / Exposure</span>
                <span className="text-2xl font-bold">${selectedBucket.amountMillions}M</span>
              </div>
              <div>
                <span className="text-xs uppercase opacity-85 block">Est. Avg Rate</span>
                <span className="text-2xl font-bold">{selectedBucket.avgRatePercent}%</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xs uppercase opacity-85 block">Maturity Horizon</span>
                <span className="text-sm font-bold">{selectedBucket.maturityHorizon}</span>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Neutral Rationale */}
            <div className="lg:col-span-5 bg-stone-50 p-5 rounded-xl border border-stone-200">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-blue-700" aria-hidden="true" />
                Official Municipal Rationale (Why the City Did It)
              </h4>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
                {selectedBucket.cityRationale}
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200">
                <span className="text-xs font-mono uppercase font-semibold text-slate-600 block mb-2">
                  Notable Projects & Issuances in This Bucket:
                </span>
                <ul className="space-y-1 text-xs sm:text-sm text-slate-700">
                  {selectedBucket.examples.map((ex) => (
                    <li key={ex} className="flex items-start gap-2">
                      <CheckCircle2
                        className="w-4 h-4 text-slate-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Explicit Taxpayer Risk Callout */}
            <div className="lg:col-span-7 bg-rose-50/80 p-5 rounded-xl border-2 border-rose-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-rose-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-700" aria-hidden="true" />
                    Explicit Taxpayer Risk Exposure
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-200 text-rose-950">
                    Severity: {selectedBucket.riskSeverity}
                  </span>
                </div>
                <p className="text-rose-950 text-sm sm:text-base leading-relaxed font-medium">
                  {selectedBucket.taxpayerRisk}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between text-xs font-mono text-rose-900">
                <span>
                  Household Share of This Bucket:{' '}
                  <strong>
                    $
                    {Math.round(
                      (selectedBucket.amountMillions * 1_000_000) / 44800
                    ).toLocaleString()}{' '}
                    per Quincy household
                  </strong>
                </span>
                <a
                  href="#step-4"
                  className="underline font-bold hover:text-rose-700"
                >
                  Stress-test in Simulator →
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Accessible Semantic Data Table Drawer per modern-web-guidance */}
        <details className="methodology-drawer bg-white rounded-xl border border-stone-300 p-4">
          <summary className="cursor-pointer font-mono text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-700" aria-hidden="true" />
              Inspect Full Debt Portfolio Table & Statutory Debt Limit Breakdown
            </span>
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 font-mono text-xs uppercase text-slate-600 bg-stone-50">
                  <th className="py-2.5 px-3">Debt Category</th>
                  <th className="py-2.5 px-3 text-right">Amount ($M)</th>
                  <th className="py-2.5 px-3 text-right">Share (%)</th>
                  <th className="py-2.5 px-3">Interest Structure</th>
                  <th className="py-2.5 px-3 text-right">Est. Rate</th>
                  <th className="py-2.5 px-3">Maturity Window</th>
                  <th className="py-2.5 px-3">Taxpayer Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {QUINCY_DEBT_BUCKETS.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{b.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      ${b.amountMillions.toFixed(1)}M
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.sharePercent}%</td>
                    <td className="py-2.5 px-3 text-slate-700">{b.interestType}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.avgRatePercent}%</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{b.maturityHorizon}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-rose-900">
                      {b.riskSeverity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
};
