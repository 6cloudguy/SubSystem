'use client';

import React, { useState } from 'react';
import { Invoice } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Eye, CheckCircle2, XCircle, CreditCard, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';

export function InvoiceList() {
  const { invoices, confirmInvoice, cancelInvoice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search invoices by # or customer name..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-44 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Invoices', value: 'ALL' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Confirmed', value: 'CONFIRMED' },
                { label: 'Paid', value: 'PAID' },
                { label: 'Overdue', value: 'OVERDUE' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ]}
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Balance Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                No invoices found in database matching your filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <span
                    onClick={() => setSelectedInvoice(inv)}
                    className="font-semibold text-slate-900 cursor-pointer hover:text-brand transition-colors"
                  >
                    {inv.invoiceNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800 text-sm">{inv.customerName}</p>
                  {inv.subscriptionNumber && (
                    <p className="text-[11px] text-slate-400">Ref: {inv.subscriptionNumber}</p>
                  )}
                </TableCell>
                <TableCell className="text-xs text-slate-600">{formatDate(inv.issueDate)}</TableCell>
                <TableCell className="text-xs text-slate-600">{formatDate(inv.dueDate)}</TableCell>
                <TableCell>
                  <Badge status={inv.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-slate-800">
                  {formatCurrency(inv.totalAmount)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {formatCurrency(inv.balanceDue)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedInvoice(inv)}
                      icon={<Eye className="h-3.5 w-3.5" />}
                    >
                      View
                    </Button>

                    {inv.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmInvoice(inv.id)}
                        icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                      >
                        Confirm
                      </Button>
                    )}

                    {(inv.status === 'CONFIRMED' || inv.status === 'OVERDUE') && (
                      <Link href={`/payments?action=record&invoiceId=${inv.id}`}>
                        <Button size="sm" icon={<CreditCard className="h-3.5 w-3.5" />}>
                          Pay
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Invoice Detail / Print View Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          size="xl"
          title={`Invoice: ${selectedInvoice.invoiceNumber}`}
          description={`Customer: ${selectedInvoice.customerName} · Issued: ${formatDate(
            selectedInvoice.issueDate
          )} · Due: ${formatDate(selectedInvoice.dueDate)}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Badge status={selectedInvoice.status} size="md" />
              <div className="flex items-center gap-2">
                {selectedInvoice.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      confirmInvoice(selectedInvoice.id);
                      setSelectedInvoice(null);
                    }}
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    Confirm Invoice
                  </Button>
                )}
                {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      cancelInvoice(selectedInvoice.id, 'Cancelled via invoice detail');
                      setSelectedInvoice(null);
                    }}
                    icon={<XCircle className="h-3.5 w-3.5" />}
                  >
                    Cancel Invoice
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Frozen Snapshot Lines (Section 4.1)
              </h4>
              <div className="divide-y divide-slate-200">
                {selectedInvoice.lines?.map((line) => (
                  <div key={line.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{line.description}</p>
                      <p className="text-slate-500 mt-0.5">
                        Qty: {line.quantity} × {formatCurrency(line.unitPrice)} · Tax: {line.taxRate}%
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(line.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 text-xs space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Total:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="text-xs bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Payment Instructions / Notes:</span>
                <p className="text-slate-600">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
