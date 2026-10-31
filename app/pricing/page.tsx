'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PricingManager } from '@/components/pricing/PricingManager';
import { Percent } from 'lucide-react';

export default function PricingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Taxes & Commercial Discounts
              </h1>
              <p className="text-sm text-slate-500">
                Maintain tax jurisdictions, promotional discounts, and applicability scopes in PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <PricingManager />
      </div>
    </AppLayout>
  );
}
