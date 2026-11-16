import React, { useState } from 'react';
import { Menu, Plus, User, LogIn, LogOut, Globe, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import { appPath } from '../utils/appPath';

export function Navbar({ onOpenSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    setCurrency(val);
  };

  const isGuest = !user || user.is_guest;

  return (
    <>
      <header className="sticky top-0 z-30 min-h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-2.5 sm:px-6 py-2 sm:py-0 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSidebar}
            className="shrink-0 p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Quick Currency Switcher */}
          <div className="min-w-0 flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 sm:px-2.5 rounded-lg text-xs font-semibold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="max-w-16 sm:max-w-none bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              title="Change Active Currency Across All Views"
            >
              {supportedCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 sm:gap-3">
          {/* Quick Actions */}
          <button
            onClick={() => navigate(appPath('/invoices?new=1', user?.is_demo))}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </button>

          <button
            onClick={() => navigate(appPath('/transactions?new=1', user?.is_demo))}
            aria-label="Add transaction"
            title="Add Transaction"
            className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          <ThemeToggle className="p-1.5" />

          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1" />

          {/* User / Authentication Status */}
          {user?.is_demo ? (
            <div className="flex items-center gap-2">
              <span title="This sample workspace is shared by demo visitors" className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">Shared demo data</span>
              <button
                onClick={() => navigate('/')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Exit demo
              </button>
            </div>
          ) : isGuest ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              aria-label="Sign in or register"
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign In / Register</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(appPath('/settings', user?.is_demo))}
                className="flex items-center gap-2 px-1.5 sm:px-2.5 py-1 rounded-lg hover:bg-slate-50 transition"
                title="Account Settings"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-[#08764A] text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
