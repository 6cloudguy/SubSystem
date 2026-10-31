'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
          info: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
        };

        const bgStyles = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          error: 'bg-rose-50 border-rose-200 text-rose-950',
          warning: 'bg-amber-50 border-amber-200 text-amber-950',
          info: 'bg-sky-50 border-sky-200 text-sky-950',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-xs transition-all animate-in slide-in-from-bottom-3 duration-200',
              bgStyles[toast.type]
            )}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium flex-1 pt-0.5 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
