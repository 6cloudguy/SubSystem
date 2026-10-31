'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';
import { RefreshCw } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Active Subscriptions & Lifecycles
              </h1>
              <p className="text-sm text-slate-500">
                Control recurring billings, pause/resume rules, contract renewals, and early closures.
              </p>
            </div>
          </div>
        </div>

        <SubscriptionList />
      </div>
    </AppLayout>
  );
}
