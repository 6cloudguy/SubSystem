'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, CreditCard, XCircle, Printer } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, confirmInvoice, cancelInvoice } = useApp();

  const invoice = invoices.find((i) => i.id === params?.id);

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Invoice not found.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/invoices')} icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Invoices
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
            Print Invoice
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
              <Badge status={invoice.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">Customer: {invoice.customerName}</p>
          </div>
          <div className="flex items-center gap-3">
            {invoice.status === 'DRAFT' && (
              <Button size="sm" onClick={() => confirmInvoice(invoice.id)} icon={<CheckCircle2 className="h-4 w-4" />}>
                Confirm Invoice
              </Button>
            )}
            {(invoice.status === 'CONFIRMED' || invoice.status === 'OVERDUE') && (
              <Link href={`/payments?action=record&invoiceId=${invoice.id}`}>
                <Button size="sm" icon={<CreditCard className="h-4 w-4" />}>
                  Record Payment
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Invoice Snapshot Lines</h3>
          <div className="divide-y divide-slate-100">
            {invoice.lines?.map((line) => (
              <div key={line.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-medium text-slate-900">{line.description}</p>
                  <p className="text-slate-500">Qty: {line.quantity} × {formatCurrency(line.unitPrice)}</p>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(line.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 text-sm space-y-2 max-w-xs ml-auto text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax Total:</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-100">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Paid to date:</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-rose-600">
              <span>Balance Due:</span>
              <span>{formatCurrency(invoice.balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
