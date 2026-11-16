import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Lock,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';

function RealisticLedgerMockup() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const currencyRates = {
    USD: { symbol: '$', mult: 1, available: '24,850.00', receivables: '5,600.00', taxReserve: '5,218.50', profit: '19,231.50' },
    EUR: { symbol: '€', mult: 0.92, available: '22,862.00', receivables: '5,152.00', taxReserve: '4,801.00', profit: '17,693.00' },
    GBP: { symbol: '£', mult: 0.79, available: '19,631.50', receivables: '4,424.00', taxReserve: '4,122.60', profit: '15,192.80' },
    PKR: { symbol: '₨', mult: 278.5, available: '6,920,725', receivables: '1,559,600', taxReserve: '1,453,352', profit: '5,355,972' }
  };

  const curr = currencyRates[selectedCurrency] || currencyRates.USD;

  return (
    <div className="relative mx-auto w-full max-w-2xl rounded-xl border border-slate-300/80 bg-white shadow-xl shadow-slate-900/5 transition-all dark:border-white/10 dark:bg-[#0e0e12] dark:shadow-none">
      {/* Window Chrome Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/20" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            IncomeDesk • Operating Ledger
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 rounded bg-slate-100 p-0.5 dark:bg-white/5 font-mono text-[10px]">
          {['USD', 'EUR', 'GBP', 'PKR'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCurrency(c)}
              className={`rounded px-1.5 py-0.5 font-bold transition ${
                selectedCurrency === c
                  ? 'bg-white text-[#08764a] shadow-xs dark:bg-white/15 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 dark:bg-white/10">
        <div className="bg-white p-3.5 dark:bg-[#0e0e12]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Available Cash</span>
            <Wallet className="h-3.5 w-3.5 text-[#08764a] dark:text-emerald-400" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {curr.symbol}{curr.available}
          </p>
          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">Across 3 accounts</span>
        </div>

        <div className="bg-white p-3.5 dark:bg-[#0e0e12]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Receivables</span>
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {curr.symbol}{curr.receivables}
          </p>
          <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400">3 open invoices</span>
        </div>

        <div className="bg-white p-3.5 dark:bg-[#0e0e12]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Tax Reserve (21%)</span>
            <PiggyBank className="h-3.5 w-3.5 text-[#08764a] dark:text-emerald-400" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {curr.symbol}{curr.taxReserve}
          </p>
          <span className="text-[9px] font-medium text-[#08764a] dark:text-emerald-400">Earmarked & ready</span>
        </div>

        <div className="bg-white p-3.5 dark:bg-[#0e0e12]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Net Q4 Profit</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#08764a] dark:text-emerald-400" />
          </div>
          <p className="mt-1.5 font-mono text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {curr.symbol}{curr.profit}
          </p>
          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">+18% vs last quarter</span>
        </div>
      </div>

      {/* Realistic Ledger Records */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent Ledger Activity
          </p>
          <span className="font-mono text-[10px] text-slate-400">Showing 4 of 48 items</span>
        </div>

        <div className="space-y-2">
          {/* Row 1 */}
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs transition dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                IN
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Apex Interactive • Design Sprint 3</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Paid via Stripe • Fee: -$105.00 deducted</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+$3,500.00</p>
              <span className="font-mono text-[9px] text-slate-400">USD account</span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs transition dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                IN
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Fintech Studio • Monthly Retainer</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Paid via Wire • Converted to base ledger</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+€2,100.00</p>
              <span className="font-mono text-[9px] text-slate-400">EUR account</span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs transition dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-rose-500/10 font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                EX
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Figma & Vercel Cloud Pro</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Recurring software • Tax-deductible expense</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">-$65.00</p>
              <span className="font-mono text-[9px] text-slate-400">Operating card</span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs transition">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/10 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                INV
              </span>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Invoice #INV-2026-09 • Nova Labs</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">Due in 5 days • Sent to client</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-slate-900 dark:text-white">$2,100.00</p>
              <span className="font-mono text-[9px] text-amber-700 dark:text-amber-400">Pending payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200 dark:bg-[#070709] dark:text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-white/10 dark:bg-[#070709]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center" aria-label="IncomeDesk home">
            <BrandLockup className="h-8 w-auto max-w-[170px]" iconClassName="h-8 w-8" nameClassName="text-base" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-xs font-semibold">
            <a href="#features" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Features</a>
            <a href="#workflow" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">How it works</a>
            <Link to="/pricing" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Pricing <span className="ml-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.2 font-mono text-[9px] text-emerald-700 dark:text-emerald-400">$10/mo</span>
            </Link>
            <Link to="/demo" className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Live demo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="p-1.5" />
            <Link to="/login" className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Sign in
            </Link>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#08764a] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Phase Status Tag */}
            <div className="inline-flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Public Beta Live • Free Access Through Dec 31, 2026
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
              The financial desk built for independent work.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-8 dark:text-slate-400">
              Stop stitching together disconnected spreadsheets, invoicing portals, and tax estimates. IncomeDesk unifies your real cash flow, multi-currency client revenue, and automated tax reserves in one focused ledger.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link 
                to="/signup" 
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#08764a] px-5 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#06613c] sm:w-auto"
              >
                Create Your Workspace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/pricing" 
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 sm:w-auto"
              >
                View Pricing ($10/mo after beta)
              </Link>
              <Link
                to="/demo"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-700/20 bg-emerald-50 px-5 py-3.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/15 sm:w-auto"
              >
                Explore live demo
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                9 currencies supported
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                1-click CSV ledger export
              </span>
            </div>
          </div>

          {/* Product UI Mockup */}
          <div className="mt-12 sm:mt-16">
            <RealisticLedgerMockup />
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="border-t border-slate-200/80 bg-slate-50/60 py-20 dark:border-white/10 dark:bg-[#0a0a0e]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                Core Functionality
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Everything you need to run your freelance finances.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Designed specifically for independent contractors, software consultants, and solo founders.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pillar 1 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0e0e12]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-[#08764a] dark:text-emerald-400">
                    <Coins className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">01</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Multi-Currency Ledger</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Bill international clients in EUR, GBP, or CAD while keeping your native balance accurately converted with historical rates.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0e0e12]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-[#08764a] dark:text-emerald-400">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">02</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Invoicing & Fees</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Generate clean PDF invoices, track partial payments, and deduct payment gateway fees automatically so your net income matches your bank.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0e0e12]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-[#08764a] dark:text-emerald-400">
                    <PiggyBank className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">03</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Tax Reserve Engine</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  IncomeDesk automatically calculates how much to set aside for quarterly taxes on every payment you receive, protecting your cash runway.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#0e0e12]">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-[#08764a] dark:text-emerald-400">
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">04</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Profit & Loss Reports</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Instant financial statements, deductible business expense audits, and complete CSV ledger downloads whenever your accountant asks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-20 border-t border-slate-200/80 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                  A Clear Workflow
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                  From invoice dispatch to tax season peace of mind.
                </h2>
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Instead of juggling separate banking apps, invoices, and tax spreadsheets, IncomeDesk connects every step into a clean operational flow.
                </p>
                <div className="mt-6">
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#08764a] transition hover:gap-2.5 dark:text-emerald-400"
                  >
                    Open your workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                    Step 01 / Bill & Track
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Create & send client invoices</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Specify currencies, payment terms, itemized milestones, and discounts. Issue PDF invoices directly to clients.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                    Step 02 / Reconcile Real Cash
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Record payments & processor fees</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    When money arrives, log the payment and Stripe/wire fees. Your available balance reflects actual cash in hand, not gross estimates.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0e0e12]">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                    Step 03 / Automated Reserves
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Set aside taxes and emergency savings</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Your predetermined tax rate is automatically applied to incoming revenue, keeping your tax liability funded before you spend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Highlight Section on Landing Page */}
        <section className="border-t border-slate-200/80 bg-slate-50/70 py-20 dark:border-white/10 dark:bg-[#0a0a0e]">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#08764a] dark:text-emerald-400">
                Transparent Pricing
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                Free now in beta. Flat $10/mo after.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                We believe in simple software without arbitrary tier locks or per-invoice fees.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-emerald-600/60 bg-emerald-50/40 p-6 dark:border-emerald-500/30 dark:bg-emerald-950/10">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Current Beta Phase
                </span>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Public Beta Access</p>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-slate-950 dark:text-white">$0</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ through Dec 31, 2026</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Zero cost, no credit card required. Full access to every feature we ship.
                </p>
                <Link
                  to="/signup"
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#06613c]"
                >
                  Join the Beta Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-xl border border-slate-300 bg-white p-6 dark:border-white/10 dark:bg-[#0e0e12]">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Post-Beta Guarantee
                </span>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">IncomeDesk Pro</p>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-extrabold text-slate-950 dark:text-white">$10</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ month • all features included</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  Every feature unlocked. Unlimited clients, invoices, and multi-currency ledgers.
                </p>
                <Link
                  to="/pricing"
                  className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Full Pricing Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 sm:p-14 text-white dark:border-white/10 dark:bg-[#0d0d11]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Ready to take control?
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Run your freelance business with total clarity.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300">
                Set up your accounts, issue your first invoice, and track your true cash flow in minutes. Free during beta.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#08764a] px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#06613c] sm:w-auto"
                >
                  Get Started Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-xs font-semibold text-white transition hover:bg-white/10 sm:w-auto"
                >
                  Sign in to Existing Account
                </Link>
              </div>
            </div>
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
