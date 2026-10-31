'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OverviewKpiCards } from '@/components/dashboard/OverviewKpiCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PlanDistributionChart } from '@/components/dashboard/PlanDistributionChart';
import { OverdueInvoicesList } from '@/components/dashboard/OverdueInvoicesList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/AppContext';
import Link from 'next/link';
import { FileCheck2, CreditCard, RefreshCw, UserPlus } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useApp();

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Welcome Banner & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {currentUser.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUser.role === 'ADMIN' ? 'Administrator' : 'Internal Staff'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Brightloop Subscription Operations: monitor real-time MRR, recurring billings, and outstanding balances.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/quotations?action=new">
              <Button size="sm" variant="outline" icon={<FileCheck2 className="h-4 w-4 text-indigo-600" />}>
                New Quote
              </Button>
            </Link>
            <Link href="/payments?action=record">
              <Button size="sm" variant="outline" icon={<CreditCard className="h-4 w-4 text-emerald-600" />}>
                Record Payment
              </Button>
            </Link>
            <Link href="/customers?action=new">
              <Button size="sm" icon={<UserPlus className="h-4 w-4" />}>
                Add Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 2.6: KPI Metric Cards */}
        <OverviewKpiCards />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <PlanDistributionChart />
          </div>
        </div>

        {/* Lower Operational Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OverdueInvoicesList />
          <RecentActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}
