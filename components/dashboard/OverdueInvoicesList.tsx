'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, ArrowRight, CreditCard, Send } from 'lucide-react';

export function OverdueInvoicesList() {
  const { invoices, showToast } = useApp();
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <CardTitle>Overdue Receivables</CardTitle>
              <CardDescription>Invoices requiring urgent payment follow-up</CardDescription>
            </div>
          </div>
          <Link href="/invoices?status=OVERDUE">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {overdueInvoices.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            🎉 Great job! No overdue invoices at this time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <Badge status="OVERDUE" size="sm" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{inv.customerName}</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Due date: {formatDate(inv.dueDate)} (Outstanding:{' '}
                    <span className="font-semibold">{formatCurrency(inv.balanceDue)}</span>)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() =>
                      showToast(`Payment reminder dispatched to ${inv.customerName}.`)
                    }
                    icon={<Send className="h-3 w-3" />}
                  >
                    Reminder
                  </Button>
                  <Link href={`/payments?action=record&invoiceId=${inv.id}`}>
                    <Button size="sm" className="text-xs" icon={<CreditCard className="h-3 w-3" />}>
                      Pay
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
