'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentMethod } from '@/lib/types';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
  preselectedInvoiceId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  preselectedCustomerId,
  preselectedInvoiceId,
}: RecordPaymentModalProps) {
  const { customers, invoices, recordPayment } = useApp();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || (customers[0]?.id || ''));
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<{ [invoiceId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Outstanding invoices for selected customer
  const customerInvoices = invoices.filter(
    (i) => i.customerId === customerId && (i.status === 'CONFIRMED' || i.status === 'OVERDUE')
  );

  useEffect(() => {
    if (preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  useEffect(() => {
    if (preselectedInvoiceId) {
      const inv = invoices.find((i) => i.id === preselectedInvoiceId);
      if (inv) {
        setCustomerId(inv.customerId);
        setAmount(inv.balanceDue);
        setAllocations({ [inv.id]: inv.balanceDue });
      }
    } else if (customerInvoices.length > 0) {
      // Auto prefill first unpaid invoice
      const firstDue = customerInvoices[0];
      setAmount(firstDue.balanceDue);
      setAllocations({ [firstDue.id]: firstDue.balanceDue });
    }
  }, [customerId, preselectedInvoiceId]);

  const handleAllocationChange = (invoiceId: string, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: Math.max(0, val),
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    if (!cust || amount <= 0) return;

    setIsSubmitting(true);
    const allocationList = Object.entries(allocations)
      .filter(([_, val]) => val > 0)
      .map(([invoiceId, val]) => ({ invoiceId, amount: val }));

    await recordPayment({
      customerId: cust.id,
      customerName: cust.name,
      amount: Number(amount),
      method,
      reference: reference || `WIRE-${Date.now()}`,
      notes,
      allocations: allocationList,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Record & Allocate Payment"
      description="Record customer receipt and allocate payment across outstanding invoices in PostgreSQL."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Confirm Payment Receipt
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Customer Account"
            required
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setAllocations({});
            }}
            options={customers.map((c) => ({
              label: `${c.name} (Balance: ${formatCurrency(c.outstandingBalance)})`,
              value: c.id,
            }))}
          />
          <Input
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            options={[
              { label: 'Bank Transfer / ACH Wire', value: 'BANK_TRANSFER' },
              { label: 'Credit Card', value: 'CREDIT_CARD' },
              { label: 'Check / Cheque', value: 'CHECK' },
              { label: 'Cash / Manual Settlement', value: 'CASH' },
            ]}
          />
          <Input
            label="Transaction Reference / Wire ID"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. WIRE-ACH-992144 or STRIPE-CHG-102"
          />
        </div>

        {/* Invoice Allocation Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Allocate to Outstanding Invoices
              </h4>
              <p className="text-[11px] text-slate-500">
                Allocated amounts automatically reduce invoice balance in the database.
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500 block">Total Allocated</span>
              <span
                className={`font-bold ${
                  totalAllocated === amount ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {formatCurrency(totalAllocated)} / {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {customerInvoices.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
              No outstanding unpaid invoices found for this customer. Payment can be recorded as unallocated credit.
            </div>
          ) : (
            <div className="space-y-2">
              {customerInvoices.map((inv) => {
                const currentAlloc = allocations[inv.id] || 0;
                const remaining = Math.max(0, inv.balanceDue - currentAlloc);

                return (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-2xs gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-500">Due: {formatDate(inv.dueDate)}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Total: {formatCurrency(inv.totalAmount)} · Balance Due:{' '}
                        <span className="font-semibold text-rose-600">
                          {formatCurrency(inv.balanceDue)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Allocated ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          max={inv.balanceDue}
                          className="w-full text-xs rounded-md border border-slate-200 p-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
                          value={currentAlloc}
                          onChange={(e) =>
                            handleAllocationChange(inv.id, parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs mt-3.5"
                        onClick={() => handleAllocationChange(inv.id, inv.balanceDue)}
                      >
                        Full
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
            Internal Settlement Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bank confirmation code, check number, reconciliation notes..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </form>
    </Modal>
  );
}
