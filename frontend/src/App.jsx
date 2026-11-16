import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Income } from './pages/Income';
import { Expenses } from './pages/Expenses';
import { Accounts } from './pages/Accounts';
import { Budgets } from './pages/Budgets';
import { Clients } from './pages/Clients';
import { Projects } from './pages/Projects';
import { Invoices } from './pages/Invoices';
import { Subscriptions } from './pages/Subscriptions';
import { Taxes } from './pages/Taxes';
import { Savings } from './pages/Savings';
import { Loans } from './pages/Loans';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { SecurityPolicy } from './pages/SecurityPolicy';
import { PricingPage } from './pages/PricingPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordRecoveryPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import { isDemoPath } from './utils/appPath';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const demoRoute = isDemoPath(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner text="Checking authentication session..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Legal & Compliance Routes (Always Accessible) */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/security" element={<SecurityPolicy />} />
      {!user && <Route path="/pricing" element={<PricingPage />} />}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {demoRoute ? (
        <Route path="/demo" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="taxes" element={<Taxes />} />
          <Route path="savings" element={<Savings />} />
          <Route path="loans" element={<Loans />} />
          <Route path="reports" element={<Reports />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="security" element={<SecurityPolicy />} />
          <Route path="*" element={<Navigate to="/demo" replace />} />
        </Route>
      ) : user ? (
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="taxes" element={<Taxes />} />
          <Route path="savings" element={<Savings />} />
          <Route path="loans" element={<Loans />} />
          <Route path="reports" element={<Reports />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage initialTab="login" />} />
          <Route path="/signup" element={<LoginPage initialTab="register" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}
