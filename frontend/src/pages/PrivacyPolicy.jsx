import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  UserCheck, 
  EyeOff, 
  FileText, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Globe, 
  FileSpreadsheet, 
  Check 
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';
import { FRONTEND_URL } from '../config/urls';

export function PrivacyPolicy() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy Architecture & Data Practices
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Privacy Policy & Data Disclosure
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            IncomeDesk is engineered on strict privacy and data ownership principles. We do not sell, rent, or monetize your accounting records to advertisers or third-party brokers.
          </p>
          <p className="mt-3 font-mono text-[11px] text-slate-400">
            Last Updated: <span className="text-slate-700 dark:text-slate-300 font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-12 space-y-12 text-xs sm:text-sm leading-relaxed">
        
        {/* Quick Highlights Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <EyeOff className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Zero Ad Tracking</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              We never sell or analyze your financial ledger entries for ad targeting or marketing profiles.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <Database className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Strict Tenant Isolation</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Each user operates inside an isolated relational partition with cryptographic query scoping.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <FileSpreadsheet className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Full Data Portability</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Download your complete transaction history, invoices, and P&L statements to CSV at any time.
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Information We Collect & Why
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            IncomeDesk collects only information strictly required to run your financial ledger, generate invoices, and calculate tax reserves:
          </p>
          
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <UserCheck className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Account & Profile Information</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                When you register or authenticate via Google OAuth 2.0, we store your full name, email address, and unique user identifier. Passwords for direct email signups are encrypted using irreversible cryptographic hashing and are never stored in plaintext.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <FileText className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Financial Ledger & Invoicing Records</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Data you enter directly to manage your freelance operations:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-1 pl-1">
                <li>Bank and financial account labels, currencies, and balances.</li>
                <li>Income and expense entries with categories, payment methods, and receipt attachments.</li>
                <li>Client directory details (names, billing emails, physical addresses).</li>
                <li>Invoices, project budgets, payment settlement dates, and processor fee deductions.</li>
                <li>Quarterly tax reserve percentages, savings goal milestones, and loan repayment records.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Globe className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Standard Technical & Operational Logs</span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Basic infrastructure request logs (IP addresses, user-agent headers, timestamped request routes) maintained temporarily for DDoS mitigation, rate limiting, and server diagnostic audits.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Google OAuth */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Google OAuth 2.0 & Data Usage Disclosures
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12] space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              IncomeDesk supports federated authentication through Google Sign-In via Supabase Auth. We exclusively request your public profile name and primary email address.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We do <strong>not</strong> request or access your Gmail messages, Google Drive files, Google Calendar events, or contact lists.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              IncomeDesk's use and transfer to any other application of information received from Google APIs adheres to the{' '}
              <a 
                href="https://developers.google.com/terms/api-services-user-data-policy" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#08764a] dark:text-emerald-400 underline hover:opacity-80 font-medium"
              >
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
          </div>
        </section>

        {/* Section 3: Subprocessors */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Infrastructure Partners & Subprocessors
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            To provide enterprise-grade reliability and encrypted backups, we host our services with vetted infrastructure leaders:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-3">Partner</th>
                  <th className="p-3">Role / Service</th>
                  <th className="p-3">Data Handled</th>
                  <th className="p-3">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Supabase Inc.</td>
                  <td className="p-3">PostgreSQL Database & Auth</td>
                  <td className="p-3">Encrypted database storage, user auth</td>
                  <td className="p-3 font-mono text-[11px]">AWS Cloud (ap-south-1)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Fly.io Inc.</td>
                  <td className="p-3">Backend API Computing</td>
                  <td className="p-3">FastAPI Python runtime, P&L generation</td>
                  <td className="p-3 font-mono text-[11px]">Singapore Region (sin)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Vercel Inc.</td>
                  <td className="p-3">Frontend Hosting & CDN</td>
                  <td className="p-3">Static compiled SPA assets</td>
                  <td className="p-3 font-mono text-[11px]">Global Edge CDN</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">Google LLC</td>
                  <td className="p-3">OAuth Identity Provider</td>
                  <td className="p-3">Federated login token handshake</td>
                  <td className="p-3 font-mono text-[11px]">Global Infrastructure</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Data Rights & Portability */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Data Rights & GDPR/CCPA Compliance
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            You retain absolute sovereignty over your financial data. In compliance with GDPR and CCPA guidelines, you have:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <h4 className="font-bold text-slate-900 dark:text-white">Right to Complete Export</h4>
              <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Export all invoices, accounts, and transaction records to clean CSV spreadsheets at any time in one click.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <h4 className="font-bold text-slate-900 dark:text-white">Right to Erasure (Account Deletion)</h4>
              <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Request complete purging of your profile, ledger records, invoices, and associated database rows by contacting support.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Contact */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#0e0e12]">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Privacy & Compliance Inquiries</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            For questions regarding this Privacy Policy or to exercise your data rights, please contact our privacy compliance team:
          </p>
          <div className="mt-4 space-y-1 text-xs font-mono">
            <p><span className="text-slate-400">Service:</span> <span className="font-bold text-slate-800 dark:text-white">IncomeDesk</span></p>
            <p><span className="text-slate-400">Contact Email:</span> <a href="mailto:privacy@freelancefinance.dev" className="text-[#08764a] dark:text-emerald-400 hover:underline font-bold">privacy@freelancefinance.dev</a></p>
            <p><span className="text-slate-400">Production App URL:</span> <a href={FRONTEND_URL} className="text-[#08764a] dark:text-emerald-400 hover:underline font-bold">{FRONTEND_URL}</a></p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-8 text-xs text-slate-500 dark:border-white/10 dark:bg-[#050507] dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} IncomeDesk. Built for independent professionals.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms of Service</Link>
            <Link to="/security" className="hover:text-slate-900 dark:hover:text-white transition">Security Architecture</Link>
            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing ($10/mo)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
