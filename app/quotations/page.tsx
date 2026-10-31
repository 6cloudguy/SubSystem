'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuotationList } from '@/components/quotations/QuotationList';
import { FileCheck2 } from 'lucide-react';

export default function QuotationsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Commercial Quotations
              </h1>
              <p className="text-sm text-slate-500">
                Generate proposals, validate lines and taxes, and convert accepted quotes into live subscriptions.
              </p>
            </div>
          </div>
        </div>

        <QuotationList />
      </div>
    </AppLayout>
  );
}
