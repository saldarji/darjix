import React from 'react';
import {
  ArrowUpRight,
  Building2,
  CheckSquare,
  ClipboardList,
  Landmark,
  Megaphone,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

export const ConclusionSection: React.FC = () => {
  const residentActions = [
    {
      title: 'Monitor the Annual Debt Book & BAN Rollovers',
      detail:
        'Before each spring budget cycle, check the Quincy Office of Municipal Finance disclosures to see how much of the ~$508M short-term BAN balance has been permanently bonded—and at what interest rate.',
    },
    {
      title: 'Ask Whether New Projects Are Inside the Levy',
      detail:
        'When major capital spending is proposed, ask your City Councilor whether debt service will be absorbed inside the Proposition 2½ operating budget (crowding out schools, fire, and roads) or placed before voters as a Debt Exclusion.',
    },
    {
      title: 'Request an Annual Quincy Center DIF Scorecard',
      detail:
        'Ask for a clear, year-by-year accounting showing whether downtown Quincy Center commercial tax increments cover 100% of DIF debt service—or whether the General Fund is subsidizing a shortfall.',
    },
    {
      title: 'Participate in Spring Budget & Fall Tax Hearings',
      detail:
        'City Council Finance Committee hearings (typically May–June) and the annual tax-classification hearing are the primary public venues to question debt-service growth and reserve targets.',
    },
  ];

  const policyActions = [
    {
      title: 'Publish a Transparent BAN-to-Bond Takeout Roadmap',
      detail:
        'Lay out a multi-year schedule for converting the $508M short-term BAN portfolio into fixed-rate bonds, including public sensitivity tables at 4.0%–6.0% borrowing rates.',
    },
    {
      title: 'Adopt a Formal Debt-Service Cap & Reserve Floor',
      detail:
        'Following peers like New Bedford (10% debt-service policy ceiling) and Springfield (consistent reserve building), dedicate a set share of certified Free Cash to Stabilization until liquid reserves better match short-term exposure.',
    },
    {
      title: 'Publish Annual POB Arbitrage & DIF Cash-Flow Audits',
      detail:
        'Give residents a plain-English annual scorecard comparing actual Quincy Retirement System investment returns against the 2.89% POB interest cost and 7.0% actuarial assumption.',
    },
  ];

  return (
    <section
      id="conclusion"
      className="py-14 md:py-20 border-b border-stone-300 bg-paper-100/70 scroll-mt-28 cv-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-800 block mb-2">
            Step 7 • Conclusion & Actionable Next Steps
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-slate-900">
            The Bottom Line for Quincy—and Concrete Steps Residents & Leaders Can Take
          </h2>
          <p className="mt-3 text-slate-700 text-base sm:text-lg">
            Quincy’s $1.62B debt footprint bought real physical assets—new schools, seawalls, public
            safety facilities, and a transformed downtown. At the same time, concentrating{' '}
            <strong>$508M in short-term BANs</strong> alongside a rigid{' '}
            <strong>$37.2M/year pension bond bill</strong> leaves far less margin for error if
            interest rates stay elevated or commercial growth slows.
          </p>
        </div>

        {/* 3 Core Takeaways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-sm">
            <span className="text-xs font-mono uppercase font-bold text-rose-800 block mb-1.5">
              Takeaway 1 • Budget Rigidity
            </span>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">
              18.6% Debt Bite Before Services
            </h3>
            <p className="text-sm text-slate-700">
              Roughly $88.8M of Quincy’s $478.5M operating budget goes to debt service—roughly
              double Cambridge (9.1%) and 6x–7x higher than Lynn (2.8%) or New Bedford (2.7%).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-sm">
            <span className="text-xs font-mono uppercase font-bold text-amber-800 block mb-1.5">
              Takeaway 2 • Rate Sensitivity
            </span>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">
              The $508M Refinancing Window
            </h3>
            <p className="text-sm text-slate-700">
              Every 1% increase in permanent bond rates when converting Quincy’s $508M in short-term
              BANs adds millions per year in fixed costs that compete with teachers, public safety,
              and road paving.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-sm">
            <span className="text-xs font-mono uppercase font-bold text-teal-800 block mb-1.5">
              Takeaway 3 • Reserve Cushion
            </span>
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">
              Thin Buffer vs. Short-Term Debt
            </h3>
            <p className="text-sm text-slate-700">
              With ~$36.5M in Free Cash and Stabilization reserves against $508M in short-term
              notes, rebuilding liquid reserves is essential to protect taxpayers from surprises.
            </p>
          </div>
        </div>

        {/* Actionable Items: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Residents & Taxpayers */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-800 block">
                  Civic Action Checklist
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <Megaphone className="w-5 h-5 text-rose-700" aria-hidden="true" />
                  What Quincy Residents Can Do
                </h3>
              </div>
              <CheckSquare className="w-6 h-6 text-slate-400 shrink-0" aria-hidden="true" />
            </div>

            <ul className="space-y-4">
              {residentActions.map((item, idx) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* For Policymakers & City Leadership */}
          <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-blue-800 block">
                    Fiscal Guardrails
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-blue-700" aria-hidden="true" />
                    Policy Benchmarks for City Leadership
                  </h3>
                </div>
                <ClipboardList className="w-6 h-6 text-slate-400 shrink-0" aria-hidden="true" />
              </div>

              <ul className="space-y-4">
                {policyActions.map((item, idx) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links Bar */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3 text-xs font-mono">
              <a
                href="#step-4"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Re-run Rate Simulators</span>
              </a>
              <a
                href="https://www.quincyma.gov/departments/municipal_finance/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-100 text-slate-800 border border-stone-300 hover:bg-stone-200 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                <span>Quincy Municipal Finance</span>
                <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </a>
              <a
                href="https://finance.quincyma.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-100 text-slate-800 border border-stone-300 hover:bg-stone-200 transition-colors"
              >
                <Landmark className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
                <span>Open Finance Portal</span>
                <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Budget & Policy Choices Residents Can Advocate For */}
        <div className="mt-8 bg-white rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6">
          <div className="border-b border-stone-200 pb-4 mb-5">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-teal-800 block">
              Policy & Budget Trade-offs
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
              Bigger Budget Choices Residents Can Advocate For
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">
              Beyond tracking upcoming bond votes, residents can push City Council and the
              Mayor’s office on how Quincy balances spending, taxes, and long-term borrowing:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-300">
              <span className="text-xs font-mono uppercase font-bold text-rose-800 block mb-1">
                1. Smarter Spending
              </span>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Prioritize Core Needs & Pause New Borrowing
              </h4>
              <p className="text-xs text-slate-700">
                Focus capital dollars on essential school, water, and road maintenance while pausing
                discretionary projects until the $508M in short-term bridge loans is locked in.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-300">
              <span className="text-xs font-mono uppercase font-bold text-blue-800 block mb-1">
                2. Revenue & Tax Options
              </span>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Honest Conversations About Taxes & Exclusions
              </h4>
              <p className="text-xs text-slate-700">
                Evaluate targeted revenue options—such as voter-approved Proposition 2½ debt
                exclusions for major schools or reviewing commercial/residential tax shares—rather
                than silently squeezing school and city operating budgets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-300">
              <span className="text-xs font-mono uppercase font-bold text-teal-800 block mb-1">
                3. Pay-As-You-Go Capital
              </span>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Stop Borrowing for Routine Expenses
              </h4>
              <p className="text-xs text-slate-700">
                Fund recurring purchases like vehicles, IT upgrades, and routine street paving out
                of annual cash budgets instead of adding 10–20 years of interest costs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-300">
              <span className="text-xs font-mono uppercase font-bold text-amber-800 block mb-1">
                4. Reserve & Debt Rules
              </span>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Enforce Clear Debt & Reserve Targets
              </h4>
              <p className="text-xs text-slate-700">
                Adopt a public ceiling on annual debt payments as a share of the budget and dedicate
                a fixed share of yearly revenue to rebuilding Free Cash and Stabilization reserves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
