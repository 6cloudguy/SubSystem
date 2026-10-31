'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlanList } from '@/components/catalog/PlanList';
import { Layers } from 'lucide-react';

export default function PlansPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Subscription Plans & Lifecycle Policies
              </h1>
              <p className="text-sm text-slate-500">
                Define billing cadences, pricing tiers, and rule permissions (Pause, Early Close, Renewal, Auto-close).
              </p>
            </div>
          </div>
        </div>

        <PlanList />
      </div>
    </AppLayout>
  );
}
