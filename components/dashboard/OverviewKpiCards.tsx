'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency } from '@/lib/utils';
import {
  RefreshCw,
  Receipt,
  CreditCard,
  AlertTriangle,
  Users2,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function OverviewKpiCards() {
  const { metrics } = useApp();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const kpis = [
    {
      label: 'Active Subscriptions',
      value: metrics.activeSubscriptionsCount,
      subtext: `Across ${metrics.customersCount} active accounts`,
      icon: RefreshCw,
      color: 'text-brand',
      bgColor: 'bg-brand-50 border-brand-200',
    },
    {
      label: 'MRR Value (Active)',
      value: formatCurrency(metrics.totalMonthlyRevenue),
      subtext: 'Normalized recurring rate',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: `Invoiced (${currentMonth})`,
      value: formatCurrency(metrics.invoicedThisMonth),
      subtext: 'Total billed this cycle',
      icon: Receipt,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 border-sky-100',
    },
    {
      label: `Cash Received (${currentMonth})`,
      value: formatCurrency(metrics.cashReceivedThisMonth),
      subtext: 'Direct settled payments',
      icon: CreditCard,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 border-violet-100',
    },
    {
      label: 'Outstanding Balance',
      value: formatCurrency(metrics.totalOutstandingBalance),
      subtext: 'Unsettled receivables',
      icon: Users2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100',
    },
    {
      label: 'Overdue Invoices',
      value: formatCurrency(metrics.overdueAmount),
      subtext: `${metrics.overdueInvoicesCount} invoices require follow-up`,
      icon: AlertTriangle,
      color: metrics.overdueInvoicesCount > 0 ? 'text-rose-600' : 'text-sub-muted',
      bgColor: metrics.overdueInvoicesCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-surface-subtle border-sub-border',
      highlight: metrics.overdueInvoicesCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={idx}
            className={`p-4 border transition-all hover:shadow-medium ${
              kpi.highlight ? 'ring-2 ring-rose-500/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sub-muted">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-sub-base tracking-tight">{kpi.value}</div>
            <p className="mt-1 text-xs text-sub-muted truncate">{kpi.subtext}</p>
          </Card>
        );
      })}
    </div>
  );
}
