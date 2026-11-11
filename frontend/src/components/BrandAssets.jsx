import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function BrandLogo({ className = '' }) {
  return (
    <img
      src="/IncomeDesk_Logo_Transparent.svg"
      alt="IncomeDesk"
      className={className}
    />
  );
}

export function BrandIcon({ className = '' }) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'light' ? '/IncomeDesk_Icon_Light.svg' : '/IncomeDesk_Icon_Transparent.svg'}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}

export function BrandLockup({ className = '', iconClassName = '', nameClassName = '' }) {
  const { theme } = useTheme();

  if (theme !== 'dark') {
    return <BrandLogo className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandIcon className={`h-9 w-9 shrink-0 object-contain ${iconClassName}`} />
      <span className={`text-white font-bold tracking-tight ${nameClassName}`}>IncomeDesk</span>
    </span>
  );
}
