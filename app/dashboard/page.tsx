'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { OverviewKpiCards } from '@/components/dashboard/OverviewKpiCards';
import { OverdueInvoicesList } from '@/components/dashboard/OverdueInvoicesList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/AppContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  FileCheck2,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Download,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, metrics, subscriptions, invoices, payments, customers, refreshData, isLoading } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  // Active / Confirmed subscriptions quick list
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE' || s.status === 'CONFIRMED').slice(0, 5);

  // Export summary report as CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Subscription #', 'Customer', 'Plan', 'Status', 'Monthly Amount', 'Billing Interval', 'Next Billing Date'];
      const rows = subscriptions.map((s) => [
        s.subscriptionNumber,
        `"${s.customerName || ''}"`,
        `"${s.planName || ''}"`,
        s.status,
        s.totalAmount,
        s.billingInterval,
        s.nextBillingDate ? formatDate(s.nextBillingDate) : 'N/A',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `brightloop_subscriptions_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Executive Header Banner */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-[12px] border border-[#DEE2E6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212]">
                Operations Overview
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF6B00] border border-[#FF6B00]/20">
                {currentUser.role === 'ADMIN' ? 'Enterprise Administrator' : 'Internal Operations Staff'}
              </span>
              <span className="text-xs text-[#6C757D]">
                &bull; Logged in as <strong className="text-[#121212]">{currentUser.name}</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Real-time monitoring of recurring subscriptions, receivables, invoicing cycles, and collections.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              title="Refresh live data"
              className="h-9 px-3 rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#FF6B00]' : 'text-[#6C757D]'}`} />
              <span>Sync</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="h-9 px-3.5 rounded-[8px] border border-[#DEE2E6] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#6C757D]" />
              <span>Export CSV</span>
            </button>

            <Link href="/quotations?action=new">
              <Button size="sm" variant="outline" icon={<FileCheck2 className="h-4 w-4 text-[#FF6B00]" />}>
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

        {/* Section 2.6: Executive KPI Metrics Cards */}
        <OverviewKpiCards />

        {/* Active Subscriptions Summary & Fast Action Table */}
        <div className="bg-[#FFFFFF] rounded-[12px] border border-[#DEE2E6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-5 border-b border-[#DEE2E6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-[#121212] text-base leading-tight">
                  Active Recurring Contracts
                </h3>
              </div>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Top active and confirmed subscriptions scheduled for automated cycle renewal.
              </p>
            </div>

            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B00] hover:text-[#E56000] transition-colors"
            >
              <span>Manage all subscriptions ({subscriptions.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#6C757D] font-semibold border-b border-[#DEE2E6] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Subscription ID</th>
                  <th className="py-3 px-5">Customer Account</th>
                  <th className="py-3 px-5">Plan</th>
                  <th className="py-3 px-5">Interval</th>
                  <th className="py-3 px-5">Cycle Amount</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Next Billing</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE2E6] text-[#121212]">
                {activeSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#6C757D]">
                      No active subscriptions registered yet. Create one via <Link href="/quotations" className="text-[#FF6B00] underline font-semibold">Quotations</Link>.
                    </td>
                  </tr>
                ) : (
                  activeSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-[#121212]">
                        <Link href={`/subscriptions/${sub.id}`} className="hover:text-[#FF6B00] hover:underline">
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 font-medium">
                        <Link href={`/customers/${sub.customerId}`} className="hover:underline">
                          {sub.customerName || 'N/A'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-[#6C757D]">
                        {sub.planName || 'Standard Tier'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F3F5] text-[#121212]">
                          {sub.billingInterval}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#121212]">
                        {formatCurrency(sub.totalAmount)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#6C757D]">
                        {sub.nextBillingDate ? formatDate(sub.nextBillingDate) : 'End of Term'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6B00] hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
