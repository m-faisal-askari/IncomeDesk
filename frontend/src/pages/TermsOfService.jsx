import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  HelpCircle,
  Coins,
  Check
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';
import { FRONTEND_URL } from '../config/urls';

export function TermsOfService() {
  const lastUpdated = "November 2026";

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200 dark:bg-[#070709] dark:text-slate-100">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-white/10 dark:bg-[#070709]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center" aria-label="IncomeDesk home">
            <BrandLockup className="h-8 w-auto max-w-[170px]" iconClassName="h-8 w-8" nameClassName="text-base" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-xs font-semibold">
            <Link to="/#features" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Features</Link>
            <Link to="/#workflow" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">How it works</Link>
            <Link to="/pricing" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Pricing <span className="ml-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.2 font-mono text-[9px] text-emerald-700 dark:text-emerald-400">$10/mo</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="p-1.5" />
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#08764a] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="border-b border-slate-200/80 bg-slate-50/60 py-14 sm:py-16 dark:border-white/10 dark:bg-[#0a0a0e]">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            <Scale className="h-3.5 w-3.5" />
            User Agreement & Platform Terms
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Please review these terms governing access to IncomeDesk during the public beta and post-beta commercial operations. By creating an account or using the desk, you agree to these terms.
          </p>
          <p className="mt-3 font-mono text-[11px] text-slate-400">
            Last Updated: <span className="text-slate-700 dark:text-slate-300 font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-12 space-y-12 text-xs sm:text-sm leading-relaxed">
        
        {/* Critical Legal Disclaimer Alert Box */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 dark:border-amber-500/20 dark:bg-amber-950/20 flex items-start gap-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm">
              Financial & Tax Disclaimer (Not Legal or CPA Advice)
            </h4>
            <p>
              IncomeDesk is an automated financial operations ledger and bookkeeping tool. 
              <strong> IncomeDesk is not a Certified Public Accountant (CPA), chartered tax advisor, registered fiduciary, or law firm.</strong>
            </p>
            <p className="text-amber-800 dark:text-amber-300/80">
              Tax reserve estimations, profit & loss statements, invoice templates, and currency conversion calculations are generated programmatically for personal administrative organization. You remain exclusively responsible for verifying your accounting figures and consulting a licensed certified tax professional for official tax filings.
            </p>
          </div>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Acceptance of Terms & Eligibility
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            By creating an account, authenticating via Google OAuth, or using any component of IncomeDesk, you confirm that you are at least 18 years old, possess the legal capacity to enter into binding agreements, and accept these Terms of Service alongside our <Link to="/privacy" className="text-[#08764a] dark:text-emerald-400 underline font-medium">Privacy Policy</Link>.
          </p>
        </section>

        {/* Section 2: Platform Scope */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Platform Scope & Operational Tools
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            IncomeDesk provides independent professionals with a financial workspace including:
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#0e0e12] flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">Multi-currency ledger with automatic exchange rates</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#0e0e12] flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">Client invoicing, partial payments & processor fee tracking</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#0e0e12] flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">Automated quarterly tax reserve calculations</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#0e0e12] flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">Profit & Loss reporting and 1-click CSV ledger exports</span>
            </div>
          </div>
        </section>

        {/* Section 3: Beta Period & Pricing Terms */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Beta Period & Post-Beta Pricing Structure
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-white/10 dark:bg-[#0e0e12] space-y-3">
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm">Public Beta Access ($0)</h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                IncomeDesk is provided completely free of charge to all users throughout the open beta period ending <strong>December 31, 2026</strong>. No credit card or payment information is required to access any feature during beta.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-white/10">
              <h4 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm">Post-Beta Commercial Rate ($10 / Month)</h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                Beginning January 1, 2027, IncomeDesk transitions to a single flat rate of <strong>$10 per month</strong>. This rate includes every current and upcoming feature without arbitrary tiers, invoice limits, or client volume surcharges. Early beta accounts retain complete access to their historical ledger and grandfathered transition assurance.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Ownership */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Data Ownership & Intellectual Property
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Your Data:</strong> You retain complete and unencumbered ownership of all invoices, client information, transactions, and ledger entries recorded in your workspace. You may export your entire transaction history to CSV at any time.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            <strong>Our Property:</strong> IncomeDesk, the brand lockup, user interface designs, Python calculation engines, and underlying code are the intellectual property of IncomeDesk and its creators.
          </p>
        </section>

        {/* Section 5: Acceptable Use */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Acceptable Use & Prohibited Conduct
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            You agree not to misuse IncomeDesk. Prohibited activities include:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-1">
            <li>Generating fraudulent, fictitious, or forged invoices.</li>
            <li>Using the service for money laundering or illegal trade transactions.</li>
            <li>Attempting to breach multi-tenant security boundaries or access other users' data.</li>
            <li>Distributing denial-of-service (DoS) traffic or automated scraping loops against the API.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              6
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Limitation of Liability & Warranty Disclaimer
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-[#0e0e12] dark:text-slate-400 space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-wider">
              THE APPLICATION IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.
            </p>
            <p className="leading-relaxed">
              IN NO EVENT SHALL INCOMEDESK OR ITS OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, TAX PENALTIES, OR BUSINESS INTERRUPTION ARISING FROM THE USE OF OR INABILITY TO USE THE SERVICE.
            </p>
          </div>
        </section>

        {/* Section 7: Legal Inquiries */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#0e0e12]">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Legal & Compliance Inquiries</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            For questions or formal legal notices concerning these Terms of Service, please contact our legal operations team:
          </p>
          <div className="mt-4 space-y-1 text-xs font-mono">
            <p><span className="text-slate-400">Service:</span> <span className="font-bold text-slate-800 dark:text-white">IncomeDesk</span></p>
            <p><span className="text-slate-400">Legal Contact:</span> <a href="mailto:legal@freelancefinance.dev" className="text-[#08764a] dark:text-emerald-400 hover:underline font-bold">legal@freelancefinance.dev</a></p>
            <p><span className="text-slate-400">Production App:</span> <a href={FRONTEND_URL} className="text-[#08764a] dark:text-emerald-400 hover:underline font-bold">{FRONTEND_URL}</a></p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-8 text-xs text-slate-500 dark:border-white/10 dark:bg-[#050507] dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} IncomeDesk. Built for independent professionals.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy Policy</Link>
            <Link to="/security" className="hover:text-slate-900 dark:hover:text-white transition">Security Architecture</Link>
            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing ($10/mo)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
