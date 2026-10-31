'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { Receipt } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Invoices & Receivables
              </h1>
              <p className="text-sm text-slate-500">
                Manage recurring invoices, due dates, payment states, and balance reconciliations.
              </p>
            </div>
          </div>
        </div>

        <InvoiceList />
      </div>
    </AppLayout>
  );
}
