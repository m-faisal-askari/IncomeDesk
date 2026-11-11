import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FieldHints } from './FieldHints';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className={`bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-h-[calc(100dvh-1rem)] flex flex-col ${maxWidth} overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150 sm:max-h-[80vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100">
          <h3 className="min-w-0 text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <FieldHints>{children}</FieldHints>
        </div>
      </div>
    </div>
  );
}
