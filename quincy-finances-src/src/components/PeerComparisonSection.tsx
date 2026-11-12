import React, { useState } from 'react';
import { PEER_CITIES_COMPARISON } from '../data/quincyFinancesData';
import { Award, BarChart3, ShieldCheck, Users } from 'lucide-react';

type MetricKey =
  | 'debtServicePctOfBudget'
  | 'debtPerCapita'
  | 'shortTermBanExposureM'
  | 'freeCashAndStabilizationM';

export const PeerComparisonSection: React.FC = () => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('debtServicePctOfBudget');

  const metricConfig: Record<
    MetricKey,
    {
      label: string;
      unit: string;
      description: string;
      format: (v: number) => string;
      maxVal: number;
      higherIsRiskier: boolean;
    }
  > = {
    debtServicePctOfBudget: {
      label: 'Debt Service as % of Operating Budget',
      unit: '%',
      description:
        'Municipal credit agencies generally consider 8%–10% of the operating budget to be a prudent ceiling for annual debt service. Quincy’s 18.6% (including POBs) is roughly double Cambridge and Somerville.',
      format: (v) => `${v.toFixed(1)}%`,
      maxVal: 22,
      higherIsRiskier: true,
    },
    debtPerCapita: {
      label: 'Total Debt Footprint Per Resident',
      unit: '$',
      description:
        'Total direct bonded debt, Pension Obligation Bonds, and short-term Bond Anticipation Notes divided by total city population.',
      format: (v) => `$${v.toLocaleString()}`,
      maxVal: 17000,
      higherIsRiskier: true,
    },
    shortTermBanExposureM: {
      label: 'Short-Term BAN Rollover Exposure ($M)',
      unit: '$M',
      description:
        'Short-term notes maturing within 12 months that are exposed to current interest rate fluctuations before permanent bonding.',
      format: (v) => `$${v.toFixed(0)}M`,
      maxVal: 550,
      higherIsRiskier: true,
    },
    freeCashAndStabilizationM: {
      label: 'Free Cash & Stabilization Reserves ($M)',
      unit: '$M',
      description:
        'The city’s liquid "rainy day" cushion available to absorb revenue shocks, construction overruns, or DIF shortfalls without cutting services.',
      format: (v) => `$${v.toFixed(1)}M`,
      maxVal: 320,
      higherIsRiskier: false,
    },
  };

  const currentMetric = metricConfig[activeMetric];

  return (
    <section id="act-5" className="py-14 md:py-20 border-b border-stone-300 cv-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Act V • Regional Peer Comparison (MA DOR DLS Databank)
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            Neighbor Showdown: Quincy vs. Cambridge, Somerville & Medford
          </h2>
          <p className="mt-3 text-slate-700 text-base sm:text-lg">
            How does Quincy’s debt strategy compare to nearby Greater Boston cities of similar urban
            scale? Comparing official Massachusetts Division of Local Services (DLS) metrics reveals
            four starkly different philosophies on municipal borrowing and reserves.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(metricConfig) as MetricKey[]).map((key) => {
            const isSelected = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-800 border-stone-300 hover:bg-stone-100'
                }`}
              >
                {metricConfig[key].label}
              </button>
            );
          })}
        </div>

        {/* Visual Bar Comparison Panel */}
        <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 mb-10">
          <div className="mb-6 pb-4 border-b border-stone-200">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-700" aria-hidden="true" />
              {currentMetric.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">{currentMetric.description}</p>
          </div>

          <div className="space-y-5">
            {PEER_CITIES_COMPARISON.map((peer) => {
              const val = peer[activeMetric];
              const widthPct = Math.min(100, Math.max(4, (val / currentMetric.maxVal) * 100));
              const isQuincy = peer.city === 'Quincy';

              const barColor = isQuincy
                ? currentMetric.higherIsRiskier
                  ? 'bg-rose-700'
                  : 'bg-amber-600'
                : currentMetric.higherIsRiskier
                ? 'bg-slate-700'
                : 'bg-teal-700';

              return (
                <div
                  key={peer.city}
                  className={`p-4 rounded-xl border ${
                    isQuincy
                      ? 'bg-rose-50/60 border-rose-300'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base sm:text-lg font-serif font-bold text-slate-900">
                        {peer.city}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-white border border-stone-300 text-slate-700">
                        {peer.Archetype}
                      </span>
                      <span className="text-xs font-mono text-slate-600 hidden sm:inline">
                        • Rating: <strong>{peer.bondRating}</strong>
                      </span>
                    </div>
                    <span
                      className={`text-xl font-mono font-bold ${
                        isQuincy ? 'text-rose-800' : 'text-slate-900'
                      }`}
                    >
                      {currentMetric.format(val)}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-4 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full ${barColor} transition-all duration-500`}
                    />
                  </div>

                  <p className="text-xs text-slate-700 mt-2">
                    <strong className="text-slate-900">Takeaway:</strong> {peer.taxpayerTakeaway}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Tale-of-the-Tape Matrix Table */}
        <div className="bg-white rounded-2xl border border-stone-300 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-stone-100 border-b border-stone-300 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-800" aria-hidden="true" />
              Complete Municipal Finance “Tale of the Tape” Matrix
            </h3>
            <span className="text-xs font-mono text-slate-600">
              Quincy vs. 3 Greater Boston Peers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 font-mono text-xs uppercase text-slate-600 bg-stone-50">
                  <th className="py-3 px-4">City & Strategy Profile</th>
                  <th className="py-3 px-3 text-right">Population</th>
                  <th className="py-3 px-3 text-right">Operating Budget</th>
                  <th className="py-3 px-3 text-right">Total Debt + BANs</th>
                  <th className="py-3 px-3 text-right">Short-Term BANs</th>
                  <th className="py-3 px-3 text-right">Debt / Capita</th>
                  <th className="py-3 px-3 text-right">Debt % of Budget</th>
                  <th className="py-3 px-3 text-right">Reserves (Free Cash)</th>
                  <th className="py-3 px-4">S&P Bond Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {PEER_CITIES_COMPARISON.map((peer) => {
                  const isQuincy = peer.city === 'Quincy';
                  return (
                    <tr
                      key={peer.city}
                      className={
                        isQuincy ? 'bg-rose-50/80 font-medium' : 'hover:bg-stone-50'
                      }
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{peer.city}</span>
                        <span className="text-xs text-slate-600">{peer.Archetype}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {peer.population.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        ${peer.operatingBudgetM.toFixed(0)}M
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        ${peer.totalDirectAndShortTermDebtM.toFixed(0)}M
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-800 font-semibold">
                        ${peer.shortTermBanExposureM.toFixed(0)}M
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        ${peer.debtPerCapita.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-900">
                        {peer.debtServicePctOfBudget.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-teal-800 font-bold">
                        ${peer.freeCashAndStabilizationM.toFixed(1)}M
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold">
                        {peer.bondRating}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
