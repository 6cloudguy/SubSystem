'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CustomerList } from '@/components/customers/CustomerList';
import { Users2 } from 'lucide-react';

export default function CustomersPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Customer Directory
              </h1>
              <p className="text-sm text-slate-500">
                Manage accounts, billing profiles, payment terms, and outstanding balances.
              </p>
            </div>
          </div>
        </div>

        <CustomerList />
      </div>
    </AppLayout>
  );
}
