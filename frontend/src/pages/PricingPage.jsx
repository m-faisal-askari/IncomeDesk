import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  CreditCard, 
  FileSpreadsheet, 
  Coins, 
  Receipt, 
  TrendingUp, 
  PiggyBank,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';

const allIncludedFeatures = [
  {
    title: 'Multi-Currency Financial Ledger',
    desc: 'Real-time multi-currency support across 9 major currencies (USD, EUR, GBP, PKR, CAD, AUD, INR, JPY, SGD) with automated rate conversion and unified balances.'
  },
  {
    title: 'Invoicing & Fee Accounting',
    desc: 'Send professional client invoices, record partial client payments, and automatically account for payment processor fees so your net earnings are always exact.'
  },
  {
    title: 'Automated Tax Reserve System',
    desc: 'Never get surprised by taxes again. Calculates exact quarterly tax reserves from your collected freelance income and tracks funds set aside.'
  },
  {
    title: 'Client & Project Economics',
    desc: 'Track project values, agreed budgets, outstanding client balances, and net profitability per client in one coherent view.'
  },
  {
    title: 'Recurring Subscription Audit',
    desc: 'Monitor software tools, domain renewals, and freelance subscriptions so recurring expenses never drain your operating cash.'
  },
  {
    title: 'Savings Milestones & Debt Tracking',
    desc: 'Track emergency funds, business equipment savings targets, and business loans with scheduled principal and interest repayments.'
  },
  {
    title: 'P&L Reports & 1-Click Exports',
    desc: 'Generate complete Profit & Loss statements, download official PDF invoices, and export your entire transaction ledger to CSV anytime.'
  },
  {
    title: 'Zero Artificial Restrictions',
    desc: 'Unlimited clients, unlimited projects, unlimited accounts, and unlimited invoice generation — with zero locked features.'
  }
];

const faqs = [
  {
    q: 'How does the free beta access work?',
    a: 'IncomeDesk is fully free for all users throughout our public beta period, ending December 31, 2026. Every current and newly added feature is completely unlocked with no credit card required to sign up.'
  },
  {
    q: 'What is the pricing after beta ends?',
    a: 'Starting January 1, 2027, IncomeDesk is a flat $10 per month. There are no complicated tiers, no per-invoice micro-charges, and no feature gates. All existing and future features are included in this single plan.'
  },
  {
    q: 'Will early beta users lose their data when beta ends?',
    a: 'No. When the beta period concludes, all your accounts, transaction records, client records, and invoice archives are preserved 100%. You will simply have the option to continue on the $10/month plan.'
  },
  {
    q: 'Can I export my financial data anytime?',
    a: 'Yes. You own your financial data. You can export your full transaction history to CSV and download copies of all invoices and P&L statements in one click at any time, even if you decide not to continue after beta.'
  },
  {
    q: 'Why a flat $10/month instead of complex tiers?',
    a: 'Freelancers need reliable software, not surprise pricing tiers based on how many clients they invoice or how many currencies they accept. $10/month keeps IncomeDesk sustainable while remaining accessible for independent creators globally.'
  }
];

export function PricingPage() {
  const { user } = useAuth();
  const isBetaUser = user?.user_type === 'beta';
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200 dark:bg-[#070709] dark:text-slate-100">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-white/10 dark:bg-[#070709]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center" aria-label="IncomeDesk home">
            <BrandLockup className="h-8 w-auto max-w-[170px]" iconClassName="h-8 w-8" nameClassName="text-base" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-xs font-semibold">
            <Link to="/#features" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Features</Link>
            <Link to="/#workflow" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">How it works</Link>
            <span className="text-[#08764a] dark:text-emerald-400">Pricing</span>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="p-1.5" />
            {user ? (
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#08764a] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]"
              >
                Go to Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Sign in
                </Link>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#08764a] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]"
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        {/* Header Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Public Beta Period Active
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Simple, honest pricing for independent work.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Full access to every feature free through December 31, 2026. After beta, one transparent rate of <strong className="font-semibold text-slate-900 dark:text-white">$10 per month</strong> with all features included — zero tiers, zero feature locks.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 items-stretch">
          
          {/* Card 1: Active Beta */}
          <div className="flex flex-col justify-between rounded-xl border-2 border-emerald-600/60 bg-emerald-50/30 p-6 sm:p-8 dark:border-emerald-500/40 dark:bg-emerald-950/10 relative">
            <div className="absolute top-4 right-4">
              <span className="rounded border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Current Access
              </span>
            </div>

            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Phase 01 • Open Beta
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                Free Beta Access
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Immediate, unrestricted access to the complete financial operations workspace while we build in the open.
              </p>

              <div className="my-6 flex items-baseline gap-2 border-b border-emerald-600/20 pb-6 dark:border-emerald-500/20">
                <span className="text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white font-mono">$0</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  / free through Dec 31, 2026
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span><strong>100% Free</strong> — No credit card required to join</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Every feature fully unlocked with zero limits</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Multi-currency ledger, invoicing & tax reserve</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Full data preservation and 1-click CSV export</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                to={user ? '/' : '/signup'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#08764a] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#06613c]"
              >
                {user ? (isBetaUser ? 'Back to your workspace' : 'Open your workspace') : 'Create Free Beta Account'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-2.5 text-center text-[10px] text-slate-500 dark:text-slate-400">
                Active beta user status granted automatically on sign up.
              </p>
            </div>
          </div>

          {/* Card 2: After Beta ($10/month) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-300/80 bg-slate-50/50 p-6 sm:p-8 dark:border-white/10 dark:bg-[#0e0e12]">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Phase 02 • Post-Beta Plan
                </p>
                <span className="rounded border border-slate-300 bg-slate-200/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  Starts 2027
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                IncomeDesk Pro
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Flat, honest, and transparent. Every feature included for one predictable price — no hidden tiers or upcharges.
              </p>

              <div className="my-6 flex items-baseline gap-2 border-b border-slate-200 pb-6 dark:border-white/10">
                <span className="text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white font-mono">$10</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  / month • all features included
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span><strong>All features included</strong> — zero locked tools or limits</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Unlimited clients, projects, invoices, and bank accounts</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Continuous updates, new integrations & rate syncing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>Early beta adopters keep grandfathered pricing assurance</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <Link
                to={user ? '/' : '/signup'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-100 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Join Beta to Lock In Early Rate
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="mt-2.5 text-center text-[10px] text-slate-500 dark:text-slate-400">
                Cancel anytime. No lock-in, no per-invoice transaction cuts.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Pricing After Beta Details */}
        <section className="mx-auto mt-20 max-w-4xl border-t border-slate-200/80 pt-16 dark:border-white/10">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
              The Post-Beta Commitment
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Why $10/month? No tricks, just honest software.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Traditional accounting software charges extra for multiple currencies, charges per invoice sent, or forces you into $30–$60/mo enterprise tiers. IncomeDesk does the opposite.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <Coins className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
              <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Multi-Currency Included</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Track payments in USD, EUR, GBP, PKR, CAD, or AUD without paying for premium foreign currency add-ons.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <Receipt className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
              <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Unlimited Invoicing</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Send as many professional client invoices as your business needs with clean PDF generation and partial payment tracking.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <PiggyBank className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
              <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Tax Reserve Engine</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Automated quarterly tax calculation and deduction tracking built specifically for self-employed workflows.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <FileSpreadsheet className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
              <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Full Data Freedom</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Never held hostage. Export your complete transaction ledger, clients, and financial statements to CSV anytime in one click.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid: What is included in the $10/mo plan */}
        <section className="mx-auto mt-20 max-w-4xl border-t border-slate-200/80 pt-16 dark:border-white/10">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
              Every feature included at $10/month
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Everything in IncomeDesk is designed to work together as a single financial desk.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {allIncludedFeatures.map((feat, idx) => (
              <div 
                key={feat.title}
                className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[9px] font-bold">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="mx-auto mt-20 max-w-3xl border-t border-slate-200/80 pt-16 dark:border-white/10">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
              Got Questions?
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={faq.q}
                  className="rounded-lg border border-slate-200 bg-white transition-colors dark:border-white/10 dark:bg-[#0e0e12]"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-xs leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-400">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto mt-20 max-w-3xl text-center rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12 dark:border-white/10 dark:bg-[#0e0e12]">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Take control of your freelance numbers today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Join the beta now at zero cost through December 31, 2026. Set up your ledger and invoices in less than 3 minutes.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#08764a] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#06613c]"
            >
              Start Free Beta Workspace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-8 text-xs text-slate-500 dark:border-white/10 dark:bg-[#050507] dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} IncomeDesk. Built for independent professionals.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms of Service</Link>
            <Link to="/security" className="hover:text-slate-900 dark:hover:text-white transition">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
