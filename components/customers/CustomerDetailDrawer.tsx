'use client';

import React from 'react';
import { Customer } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  Receipt,
  RefreshCw,
  CreditCard,
  Edit,
} from 'lucide-react';
import Link from 'next/link';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailDrawer({ customer, isOpen, onClose, onEdit }: CustomerDetailDrawerProps) {
  const { subscriptions, quotations, invoices } = useApp();

  if (!customer) return null;

  const customerSubs = subscriptions.filter((s) => s.customerId === customer.id);
  const customerQuotes = quotations.filter((q) => q.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <span>{customer.name}</span>
          <Badge status={customer.status} />
        </div>
      }
      description={customer.company}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit className="h-3.5 w-3.5" />}
            onClick={() => onEdit(customer)}
          >
            Edit Customer
          </Button>
          <div className="flex items-center gap-2">
            <Link href={`/quotations?action=new&customerId=${customer.id}`}>
              <Button size="sm" variant="outline" icon={<FileCheck2 className="h-3.5 w-3.5" />}>
                Create Quote
              </Button>
            </Link>
            <Link href={`/payments?action=record&customerId=${customer.id}`}>
              <Button size="sm" icon={<CreditCard className="h-3.5 w-3.5" />}>
                Record Payment
              </Button>
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Balance Banner */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs uppercase font-semibold text-slate-500">Total Lifetime Spent</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(customer.totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-slate-500">Outstanding Balance</p>
            <p
              className={`text-xl font-bold mt-1 ${
                customer.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(customer.outstandingBalance)}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2.5 text-xs sm:text-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{customer.phone || 'No phone recorded'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{customer.billingAddress || 'No billing address recorded'}</span>
            </div>
            {customer.taxId && (
              <div className="text-slate-600 sm:col-span-2 text-xs">
                Tax ID / VAT: <span className="font-semibold text-slate-900">{customer.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Linked Active Subscriptions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subscriptions ({customerSubs.length})
            </h4>
          </div>
          {customerSubs.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
              No subscriptions active for this customer.
            </p>
          ) : (
            <div className="space-y-2">
              {customerSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/80 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {sub.subscriptionNumber}
                      </span>
                      <Badge status={sub.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sub.planName} · {sub.billingInterval}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(sub.totalAmount)}
                    </p>
                    <p className="text-[11px] text-slate-500">Next: {formatDate(sub.nextBillingDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Invoices */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Invoices ({customerInvoices.length})
          </h4>
          {customerInvoices.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
              No invoices generated yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customerInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800">{inv.invoiceNumber}</span>
                      <p className="text-[11px] text-slate-400">Due {formatDate(inv.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800">
                        {formatCurrency(inv.totalAmount)}
                      </span>
                      {inv.balanceDue > 0 && (
                        <p className="text-[10px] text-rose-600">Due: {formatCurrency(inv.balanceDue)}</p>
                      )}
                    </div>
                    <Badge status={inv.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
