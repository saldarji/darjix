import React, { useState } from 'react';
import { HeroReceiptSection } from './components/HeroReceiptSection';
import { DebtAnatomySection } from './components/DebtAnatomySection';
import { MaturityWallSection } from './components/MaturityWallSection';
import { RiskSimulatorsSection } from './components/RiskSimulatorsSection';
import { PeerComparisonSection } from './components/PeerComparisonSection';
import { NationalDebtComparisonSection } from './components/NationalDebtComparisonSection';
import { ConclusionSection } from './components/ConclusionSection';
import { BookOpen, ExternalLink, Landmark, Scale, ShieldAlert } from 'lucide-react';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { href: '#introduction', label: 'Introduction' },
    { href: '#step-1', label: '1. Your Household Debt Receipt' },
    { href: '#step-2', label: '2. Anatomy of the Liabilities' },
    { href: '#step-3', label: '3. Maturity Wall & BAN Cliff' },
    { href: '#step-4', label: '4. Rate & Risk Simulators' },
    { href: '#step-5', label: '5. Peer City Comparison' },
    { href: '#step-6', label: '6. US Debt Comparison' },
    { href: '#conclusion', label: '7. Conclusion & Action Items' },
  ];

  const glossaryTerms = [
    {
      term: 'Bond Anticipation Notes (BANs)',
      category: 'Short-Term Debt (~$508M in Quincy)',
      definition:
        'Short-term interest-bearing notes (usually 1 year or less) issued by a municipality to finance capital projects during construction before converting them into long-term bonds. Rolling large BAN balances during rising interest rate cycles exposes taxpayers to sharp refinancing shocks.',
    },
    {
      term: 'Pension Obligation Bonds (POBs)',
      category: 'Taxable Arbitrage Bonds ($475M in Quincy)',
      definition:
        'Taxable general obligation bonds issued to pay off a municipality’s unfunded pension liability. The strategy bets that pension fund investment returns (~7.0% target) will exceed the bond interest rate (~2.89%), but converts a flexible pension schedule into an unbreakable $37.2M/year legal debt payment through 2040.',
    },
    {
      term: 'District Improvement Financing (DIF)',
      category: 'Downtown Quincy Center Debt (>$200M)',
      definition:
        'A Massachusetts economic development financing tool (M.G.L. c. 40Q) that earmarks new property tax growth ("tax increment") within a designated district to pay for public garages, roads, and utilities. If private commercial growth falls short, the City’s General Fund remains legally on the hook.',
    },
    {
      term: 'Proposition 2½ & Debt Exclusions',
      category: 'Massachusetts Tax Levy Cap',
      definition:
        'Massachusetts law capping a city’s annual property tax levy increase at 2.5% plus new construction growth. Unlike many towns that ask voters to approve temporary "Debt Exclusions" for new schools, Quincy services nearly all of its debt inside the standard levy—meaning rising debt service directly crowds out operating budgets.',
    },
    {
      term: 'Equalized Valuation (EQV) & Free Cash',
      category: 'MA DOR DLS Benchmarks',
      definition:
        'EQV is the Massachusetts Department of Revenue’s biennial estimate of the full and fair cash value of all property in a municipality. Free Cash is unrestricted available funds certified annually by the DOR that serve as a city’s primary fiscal buffer alongside Stabilization reserves.',
    },
  ];

  const filteredGlossary = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-paper-50 text-slate-900 flex flex-col">
      {/* Top Editorial Header */}
      <header className="sticky top-0 z-40 bg-paper-50/95 backdrop-blur border-b border-stone-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <a
            href="#introduction"
            className="flex items-center gap-2.5 font-serif font-bold text-slate-900 text-base sm:text-lg shrink-0"
          >
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-mono text-xs font-bold">
              Q
            </span>
            <span>Quincy Debt & Taxpayer Risk Atlas</span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="#step-4"
              className="px-3 py-1.5 rounded-lg bg-civic-crimson text-slate-900 font-mono text-xs font-bold hover:bg-rose-400 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Run Rate Simulator</span>
            </a>
          </div>
        </div>
      </header>

      {/* Standard Step-by-Step Analysis Navigation Bar (Below Header) */}
      <nav
        aria-label="Analysis steps"
        className="bg-paper-100 border-b border-stone-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <ol className="flex items-center gap-1.5 overflow-x-auto lg:flex-wrap text-xs font-mono">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  className="inline-block px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-slate-800 font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <HeroReceiptSection />
        <DebtAnatomySection />
        <MaturityWallSection />
        <RiskSimulatorsSection />
        <PeerComparisonSection />
        <NationalDebtComparisonSection />
        <ConclusionSection />

        {/* Municipal Finance Glossary & Methodology Search Section */}
        <section id="methodology" className="py-14 bg-stone-100 border-b border-stone-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-600 block mb-1">
                  Reference & Methodology
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-rose-800" aria-hidden="true" />
                  Municipal Debt Glossary & Public Data Sources
                </h2>
              </div>

              {/* Semantic <search> landmark per modern-web-guidance */}
              <search className="w-full sm:w-80">
                <label htmlFor="glossary-search" className="sr-only">
                  Filter municipal finance terms
                </label>
                <input
                  id="glossary-search"
                  type="search"
                  placeholder="Filter terms (e.g., BANs, POB, DIF)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400"
                />
              </search>
            </div>

            {/* Exclusive Accordion Set using <details name="..."> per modern-web-guidance */}
            <div className="space-y-3 mb-10">
              {filteredGlossary.map((item, idx) => (
                <details
                  key={item.term}
                  name="quincy-finance-glossary"
                  open={idx === 0}
                  className="methodology-drawer bg-white rounded-xl border border-stone-300 p-4 shadow-sm"
                >
                  <summary className="cursor-pointer font-serif font-bold text-base sm:text-lg text-slate-900 flex items-center justify-between">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span>{item.term}</span>
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-slate-700 border border-stone-300">
                        {item.category}
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 pt-3 border-t border-stone-200 text-sm sm:text-base text-slate-700">
                    {item.definition}
                  </p>
                </details>
              ))}
            </div>

            {/* Official Public Data Sources Attribution */}
            <figure className="bg-white p-6 rounded-2xl border border-stone-300">
              <blockquote
                cite="https://www.mass.gov/orgs/division-of-local-services"
                className="text-sm text-slate-700 space-y-2"
              >
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-800" aria-hidden="true" />
                  Data Verification & Public Record Citations:
                </p>
                <p>
                  All figures in this interactive investigation are synthesized from publicly
                  available municipal disclosures: (1) City of Quincy Office of Municipal Finance
                  Annual Debt Books, Official Statements for General Obligation Bonds & BANs, and
                  FY2025–FY2026 Operating Budget filings; (2) Massachusetts Department of Revenue
                  Division of Local Services (DLS) Municipal Finance Trend Dashboard & Category 6
                  Debt Service Databank for Quincy, Cambridge, Somerville, Medford, Brockton, Lynn,
                  Springfield, and New Bedford; and (3)
                  Federal Reserve Economic Data (FRED) and Congressional Budget Office (CBO) federal
                  net interest baselines.
                </p>
              </blockquote>
              <figcaption className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap gap-4 text-xs font-mono text-blue-800">
                <a
                  href="https://www.quincyma.gov/departments/municipal_finance/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <cite>Quincy Office of Municipal Finance</cite>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
                <a
                  href="https://finance.quincyma.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <cite>Quincy Open Finance Portal (ClearGov)</cite>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
                <a
                  href="https://www.mass.gov/orgs/division-of-local-services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <cite>MA DOR Division of Local Services (DLS) Databank</cite>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>City of Quincy Municipal Debt & Taxpayer Risk Infographic</span>
            </div>
            <div className="text-slate-400">
              Built for civic transparency & public financial literacy • Neutral analysis with
              explicit taxpayer risk modeling
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed text-center sm:text-left">
            <strong className="text-amber-400 font-mono uppercase tracking-wider mr-1.5">
              Disclaimer:
            </strong>
            This site was made with Gemini (AI) using publicly available municipal and state
            financial disclosures. If you notice any issues with the data or calculations, please
            contact me using the form on the{' '}
            <a
              href="https://darjix.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300 font-medium inline-flex items-center gap-1"
            >
              <span>contact page</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>{' '}
            (<span className="font-mono text-slate-400">https://darjix.com/contact</span>).
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
