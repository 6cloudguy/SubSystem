'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { AlertTriangle, RefreshCw, ExternalLink, X } from 'lucide-react';

export function DatabaseStatusBanner() {
  const { dbConnectionError, refreshData } = useApp();
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!dbConnectionError || dismissed) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    await refreshData();
    setIsRetrying(false);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 sm:px-6 transition-all animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 max-w-7xl mx-auto">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-900 leading-tight">
              PostgreSQL Sync Alert
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-tight">
              Cannot sync live data from <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">192.168.18.180:5432</code>: {dbConnectionError}.
              Ensure root <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">.env</code> is configured and run <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[10px]">npx prisma generate</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-800 bg-amber-100/80 hover:bg-amber-200/80 transition-colors"
          >
            <span>Diagnostics</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>Retry</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-amber-500 hover:text-amber-800 hover:bg-amber-100/60 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
