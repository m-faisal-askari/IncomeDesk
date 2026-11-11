import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLockup } from '../components/BrandAssets';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../api/supabase';

function RecoveryPageFrame({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#070709] dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:left-6 sm:top-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>
      <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLockup className="mx-auto h-9 w-auto max-w-[200px]" iconClassName="h-9 w-9" nameClassName="text-xl" />
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Reset your IncomeDesk password securely</p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200/90 py-8 px-6 shadow-sm rounded-xl sm:px-10 dark:bg-[#0e0e12] dark:border-white/10">
          {children}
        </div>
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-4">
          <Link to="/privacy" className="hover:text-slate-800 dark:hover:text-white transition">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-slate-800 dark:hover:text-white transition">Terms of Service</Link>
          <span>·</span>
          <Link to="/pricing" className="hover:text-slate-800 dark:hover:text-white transition">Pricing Details</Link>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSending(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not send a password reset email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <RecoveryPageFrame>
      {sent ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Check your email</h1>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            If an IncomeDesk account matches that email, a password reset link is on its way.
          </p>
          <Link to="/login" className="inline-flex items-center justify-center rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Forgot your password?</h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Enter the email address on your account and we’ll send a reset link.
            </p>
          </div>

          {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="reset-email" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="alex@freelance.dev"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#08764a] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c] disabled:opacity-50"
            >
              {isSending ? 'Sending reset link…' : 'Send password reset link'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#08764a] dark:text-emerald-400 hover:underline">
              Sign in
            </Link>
          </div>
        </>
      )}
    </RecoveryPageFrame>
  );
}

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('checking'); // 'checking' | 'ready' | 'invalid' | 'success'
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const recoveryEventReceived = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryEventReceived.current = true;
        setStatus('ready');
      }
    });

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) return;
        setStatus(!sessionError && (data?.session || recoveryEventReceived.current) ? 'ready' : 'invalid');
      })
      .catch(() => {
        if (isMounted) setStatus('invalid');
      });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword(password);
      setStatus('success');
      setPassword('');
      setConfirmPassword('');
    } catch (updateError) {
      setError(updateError.message || 'Could not update your password. Please request a new reset link.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RecoveryPageFrame>
      {status === 'checking' && (
        <div className="py-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Checking your reset link…</div>
      )}

      {status === 'invalid' && (
        <div className="space-y-4 text-center">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Reset link unavailable</h1>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">This link may have expired or already been used. Request a new one to continue.</p>
          <Link to="/forgot-password" className="inline-flex items-center justify-center rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]">
            Request a new link
          </Link>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Password updated</h1>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Your new password is ready to use.</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c]">
            Continue to IncomeDesk
          </Link>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="mb-6">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Choose a new password</h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Use at least 8 characters.</p>
          </div>

          {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="new-password" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08764a] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08764a] dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-[#08764a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#06613c] disabled:opacity-50"
            >
              {isSaving ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </RecoveryPageFrame>
  );
}
