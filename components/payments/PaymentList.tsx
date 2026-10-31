'use client';

import React, { useState } from 'react';
import { Payment } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, CreditCard, ArrowRight, Eye } from 'lucide-react';
import { RecordPaymentModal } from './RecordPaymentModal';
import { Modal } from '@/components/ui/Modal';

export function PaymentList() {
  const { payments } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filtered = payments.filter((pay) => {
    const matchesSearch =
      pay.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || pay.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search payments by #, customer, or reference..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-48 shrink-0">
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { label: 'All Payment Methods', value: 'ALL' },
                { label: 'Bank Transfer / ACH', value: 'BANK_TRANSFER' },
                { label: 'Credit Card', value: 'CREDIT_CARD' },
                { label: 'Check / Cheque', value: 'CHECK' },
                { label: 'Cash', value: 'CASH' },
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={() => setIsRecordOpen(true)} icon={<Plus className="h-4 w-4" />}>
          Record Payment
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference / Wire ID</TableHead>
            <TableHead>Allocated Invoices</TableHead>
            <TableHead className="text-right">Amount Settled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                No payment transactions found in database matching your filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((pay) => (
              <TableRow key={pay.id}>
                <TableCell>
                  <span
                    onClick={() => setSelectedPayment(pay)}
                    className="font-semibold text-slate-900 cursor-pointer hover:text-brand transition-colors"
                  >
                    {pay.paymentNumber}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-600">{formatDate(pay.date)}</TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800 text-sm">{pay.customerName}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {pay.method.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-mono">{pay.reference}</TableCell>
                <TableCell>
                  {pay.allocations && pay.allocations.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {pay.allocations.map((a) => (
                        <span
                          key={a.id}
                          className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700"
                        >
                          {a.invoiceNumber}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Unallocated</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  {formatCurrency(pay.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPayment(pay)}
                    icon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          size="md"
          title={`Payment Receipt: ${selectedPayment.paymentNumber}`}
          description={`Customer: ${selectedPayment.customerName} · Date: ${formatDate(
            selectedPayment.date
          )}`}
          footer={
            <div className="flex justify-between w-full items-center">
              <Badge status={selectedPayment.status} />
              <Button size="sm" variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Payment Amount</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Settlement Method</span>
                <span className="font-semibold text-slate-800">
                  {selectedPayment.method.replace('_', ' ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Reference Identifier</span>
                <span className="font-mono text-slate-800">{selectedPayment.reference}</span>
              </div>
            </div>

            {selectedPayment.allocations && selectedPayment.allocations.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-700 mb-2">Allocated Invoices</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg p-2 bg-white">
                  {selectedPayment.allocations.map((a) => (
                    <div key={a.id} className="py-2 flex justify-between">
                      <span className="font-mono text-slate-700">{a.invoiceNumber}</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(a.allocatedAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPayment.notes && (
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Notes:</span>
                <p className="text-slate-600">{selectedPayment.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} />
    </div>
  );
}
