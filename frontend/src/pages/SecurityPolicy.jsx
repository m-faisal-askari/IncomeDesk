import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Server, 
  Cpu, 
  ArrowLeft, 
  Check, 
  Key, 
  HardDrive, 
  FileSpreadsheet,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';
import { FRONTEND_URL } from '../config/urls';

export function SecurityPolicy() {
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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Security Architecture & Ledger Integrity
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Security & Safeguards
          </h1>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            How we protect your freelance finances, account balances, client records, and identity through multi-tenant separation, cryptographic encryption, and authoritative calculation standards.
          </p>
          <p className="mt-3 font-mono text-[11px] text-slate-400">
            Last Updated: <span className="text-slate-700 dark:text-slate-300 font-semibold">{lastUpdated}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-12 space-y-12 text-xs sm:text-sm leading-relaxed">
        
        {/* Core Security Principles Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <Lock className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">End-to-End Encryption</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              TLS 1.3 encrypted transit across all endpoints and AES-256 database volume storage at rest on Supabase.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <Database className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Strict Tenant Isolation</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Relational query scoping and row-level ownership guarantees zero accidental cross-user data exposure.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <Cpu className="h-5 w-5 text-[#08764a] dark:text-emerald-400" />
            <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">Authoritative Decimal Math</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Python Decimal calculations with zero floating-point drift on currency conversions and tax reserves.
            </p>
          </div>
        </div>

        {/* Section 1: Multi-Tenant Data Isolation */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Strict Multi-Tenant Database Isolation
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Unlike simple consumer apps that pool user records together, IncomeDesk enforces strict multi-tenancy at the database and application layers:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tenant-Scoped SQL Queries</span>
              </div>
              <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Every single database query executes strictly against the validated user ID decoded from cryptographic JWT tokens. There are no shared multi-user tables without user-level constraints.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Relational Foreign Key Integrity</span>
              </div>
              <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Invoices, clients, transactions, and accounts are bound by relational database constraints. Records cannot cross-reference entities owned by a different account ID under any circumstance.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Cryptographic Encryption */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Encryption in Transit & Storage at Rest
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Server className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Transit Security (TLS 1.3 + HSTS)</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                All communications between client browsers, Vercel edge networks, Fly.io compute instances, and Supabase PostgreSQL clusters are strictly encrypted using TLS 1.3 with forced HTTP Strict Transport Security (HSTS).
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <HardDrive className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Storage Security (AES-256)</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                All database volumes, automated snapshot backups, and uploaded attachments hosted on Supabase PostgreSQL are encrypted at rest using industry-standard AES-256 bit encryption keys.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Calculation Precision */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Financial Calculation Precision (No Floating-Point Drift)
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Most generic SaaS products perform currency math using binary IEEE-754 floating-point numbers in browser JavaScript, introducing dangerous fractional rounding errors (such as <code className="font-mono text-emerald-700 dark:text-emerald-400">0.1 + 0.2 = 0.30000000000000004</code>).
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              IncomeDesk prevents this entirely: all currency conversions, payment processor fee calculations, tax reserve withholding ratios, and invoice line items are computed server-side using Python's authoritative <code className="font-mono text-emerald-700 dark:text-emerald-400">Decimal(ROUND_HALF_UP)</code> engine, backed by automated Pytest reconciliation tests prior to every release.
            </p>
          </div>
        </section>

        {/* Section 4: Token Authentication */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Authentication & Session Security
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12] space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>HMAC-SHA256 & Asymmetric Signing:</strong> Session access tokens are cryptographically signed with strict expiration lifespans. Unsigned or forged claims are rejected immediately.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Google OAuth 2.0 Integration:</strong> When using Google authentication, credentials never touch IncomeDesk servers. We request only minimal identity scopes (email and display name).
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-400">
                <strong>Instant Session Invalidation:</strong> Logging out immediately purges local browser credentials and invalidates the session on Supabase Auth.
              </span>
            </div>
          </div>
        </section>

        {/* Section 5: Data Sovereignty */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-mono text-[10px] font-bold">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
              Data Sovereignty & 1-Click Portability
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Your financial ledger belongs to you. We believe freelancers should never be locked into proprietary data formats:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <FileSpreadsheet className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Complete CSV Ledger Exports</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Export all transactions, categorized expenses, and invoice records to clean CSV spreadsheets at any time in one click.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0e0e12]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <FileCheck className="h-4 w-4 text-[#08764a] dark:text-emerald-400" />
                <span>Direct PDF Invoicing Archive</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                All client invoices generate standalone, auditable PDF documents that remain accessible and downloadable for tax filings.
              </p>
            </div>
          </div>
        </section>

        {/* Security Contact Box */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#0e0e12]">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white">Responsible Security Disclosure</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            If you believe you have discovered a vulnerability or security flaw in IncomeDesk, please notify our team promptly. We review all reports with priority and do not take legal action against good-faith security researchers.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Security Email:</span>
            <a href="mailto:security@freelancefinance.dev" className="text-[#08764a] dark:text-emerald-400 hover:underline font-bold">
              security@freelancefinance.dev
            </a>
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
            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing ($10/mo)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
