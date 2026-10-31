'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StaffManager } from '@/components/staff/StaffManager';
import { ShieldCheck } from 'lucide-react';

export default function StaffPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 border border-brand-200 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Staff & Role Administration
              </h1>
              <p className="text-sm text-slate-500">
                Provision internal staff accounts and manage role-based operational permissions in PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <StaffManager />
      </div>
    </AppLayout>
  );
}
