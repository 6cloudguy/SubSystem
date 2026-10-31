'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/lib/AppContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, MapPin, Receipt, RefreshCw, FileCheck2 } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, subscriptions, invoices, quotations } = useApp();

  const customerId = params?.id as string;
  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Customer not found.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/customers')}>
            Back to Customers
          </Button>
        </div>
      </AppLayout>
    );
  }

  const customerSubs = subscriptions.filter((s) => s.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);
  const customerQuotes = quotations.filter((q) => q.customerId === customer.id);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/customers')} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Customer Directory
        </Button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              <Badge status={customer.status} />
            </div>
            <p className="text-sm text-slate-500 mt-1">{customer.company}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/quotations?action=new&customerId=${customer.id}`}>
              <Button size="sm" variant="outline" icon={<FileCheck2 className="h-4 w-4" />}>
                New Quotation
              </Button>
            </Link>
            <Link href={`/payments?action=record&customerId=${customer.id}`}>
              <Button size="sm">Record Payment</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Contact Details</h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{customer.billingAddress}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Financial Position</h3>
            <div className="pt-2">
              <p className="text-xs text-slate-500">Total Revenue Invoiced</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(customer.totalSpent)}</p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-500">Unsettled Balance Due</p>
              <p className={`text-xl font-bold ${customer.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(customer.outstandingBalance)}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Internal Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {customer.notes || 'No notes on file.'}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
