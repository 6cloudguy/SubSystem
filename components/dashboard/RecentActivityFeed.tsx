'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  History,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  FileText,
  CreditCard,
  XCircle,
} from 'lucide-react';

export function RecentActivityFeed() {
  const { subscriptions, payments } = useApp();

  // Aggregate subscription events & payments into a timeline
  const activities: {
    id: string;
    type: string;
    title: string;
    description: string;
    date: string;
    icon: React.ReactNode;
  }[] = [];

  subscriptions.forEach((sub) => {
    sub.events.forEach((ev) => {
      let icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      if (ev.eventType === 'PAUSED') icon = <PauseCircle className="h-4 w-4 text-amber-600" />;
      if (ev.eventType === 'RESUMED') icon = <PlayCircle className="h-4 w-4 text-sky-600" />;
      if (ev.eventType === 'CLOSED') icon = <XCircle className="h-4 w-4 text-rose-600" />;
      if (ev.eventType === 'INVOICED') icon = <FileText className="h-4 w-4 text-indigo-600" />;

      activities.push({
        id: ev.id,
        type: ev.eventType,
        title: `${sub.subscriptionNumber} (${sub.customerName})`,
        description: `${ev.eventType}: ${ev.note} — by ${ev.actor}`,
        date: ev.timestamp,
        icon,
      });
    });
  });

  payments.forEach((pay) => {
    activities.push({
      id: pay.id,
      type: 'PAYMENT',
      title: `Payment ${pay.paymentNumber} (${pay.customerName})`,
      description: `Settled $${pay.amount.toFixed(2)} via ${pay.method.replace('_', ' ')} (${pay.reference})`,
      date: pay.createdAt,
      icon: <CreditCard className="h-4 w-4 text-violet-600" />,
    });
  });

  // Sort latest first
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <History className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle>Lifecycle & Audit Feed</CardTitle>
            <CardDescription>Real-time log of subscription actions and settlements</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {activities.slice(0, 7).map((act) => (
            <div key={act.id} className="flex items-start gap-3 p-4 hover:bg-slate-50/70 transition-colors">
              <div className="mt-0.5 p-1 rounded-full bg-slate-50 border border-slate-200">
                {act.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">{formatDate(act.date)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
