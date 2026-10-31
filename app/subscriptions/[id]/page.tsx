'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, RefreshCw, History, FileText } from 'lucide-react';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { subscriptions, generateRecurringInvoice } = useApp();

  const sub = subscriptions.find((s) => s.id === params?.id);

  if (!sub) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Subscription not found.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/subscriptions')}>
            Back to Subscriptions
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/subscriptions')} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Subscriptions
        </Button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{sub.subscriptionNumber}</h1>
              <Badge status={sub.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">Customer: {sub.customerName} · Plan: {sub.planName}</p>
          </div>
          {sub.status === 'ACTIVE' && (
            <Button size="sm" onClick={() => generateRecurringInvoice(sub.id)} icon={<FileText className="h-4 w-4" />}>
              Generate Recurring Invoice
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Contracted Lines</h3>
            <div className="divide-y divide-slate-100">
              {sub.lines?.map((line) => (
                <div key={line.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-slate-900">{line.description}</p>
                    <p className="text-slate-400">Qty: {line.quantity} × {formatCurrency(line.unitPrice)}</p>
                  </div>
                  <span className="font-bold text-slate-800">{formatCurrency(line.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <History className="h-4 w-4 text-brand" />
              Event History Audit Trail
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sub.events?.map((ev) => (
                <div key={ev.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{ev.eventType}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{formatDate(ev.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{ev.note}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">By: {ev.actor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
