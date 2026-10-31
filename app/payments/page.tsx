'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaymentList } from '@/components/payments/PaymentList';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Payment Receipts & Reconciliations
              </h1>
              <p className="text-sm text-slate-500">
                Record bank transfers, allocate receipts across outstanding invoices, and update customer balances.
              </p>
            </div>
          </div>
        </div>

        <PaymentList />
      </div>
    </AppLayout>
  );
}
