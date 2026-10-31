'use client';

import React, { useState } from 'react';
import { Quotation } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, Eye, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { QuotationModal } from './QuotationModal';
import { Modal } from '@/components/ui/Modal';

export function QuotationList() {
  const { quotations, convertQuotationToSubscription, updateQuotation, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConvert = async (quotationId: string) => {
    setIsConverting(true);
    await convertQuotationToSubscription(quotationId);
    setIsConverting(false);
    setSelectedQuotation(null);
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search by quote number or customer name..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-44 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Quotations', value: 'ALL' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Sent', value: 'SENT' },
                { label: 'Accepted', value: 'ACCEPTED' },
                { label: 'Converted', value: 'CONVERTED' },
              ]}
            />
          </div>
        </div>

        <Button size="sm" onClick={() => setIsCreateOpen(true)} icon={<Plus className="h-4 w-4" />}>
          New Quotation
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quotation #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Template / Proposal</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                No quotations found in database matching your filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  <span
                    onClick={() => setSelectedQuotation(quote)}
                    className="font-semibold text-slate-900 cursor-pointer hover:text-brand transition-colors"
                  >
                    {quote.quotationNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{quote.customerName}</p>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {quote.templateName || 'Standard'}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {formatDate(quote.validityDate)}
                </TableCell>
                <TableCell>
                  <Badge status={quote.status} />
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900">
                  {formatCurrency(quote.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedQuotation(quote)}
                      icon={<Eye className="h-3.5 w-3.5" />}
                    >
                      View
                    </Button>

                    {quote.status !== 'CONVERTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvert(quote.id)}
                        isLoading={isConverting}
                        icon={<RefreshCw className="h-3.5 w-3.5 text-brand" />}
                      >
                        Convert to Sub
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Quotation Detail / Document Viewer Modal */}
      {selectedQuotation && (
        <Modal
          isOpen={!!selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          size="xl"
          title={`Quotation Document: ${selectedQuotation.quotationNumber}`}
          description={`Customer: ${selectedQuotation.customerName} · Valid until: ${formatDate(
            selectedQuotation.validityDate
          )}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Badge status={selectedQuotation.status} size="md" />
              <div className="flex items-center gap-2">
                {selectedQuotation.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateQuotation(selectedQuotation.id, { status: 'SENT' });
                      showToast(`Quotation ${selectedQuotation.quotationNumber} marked as Sent.`);
                      setSelectedQuotation(null);
                    }}
                    icon={<Send className="h-3.5 w-3.5" />}
                  >
                    Mark Sent
                  </Button>
                )}

                {selectedQuotation.status !== 'CONVERTED' && (
                  <Button
                    size="sm"
                    onClick={() => handleConvert(selectedQuotation.id)}
                    isLoading={isConverting}
                    icon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    Convert to Subscription
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quotation Snapshot Lines
              </h4>
              <div className="divide-y divide-slate-200">
                {selectedQuotation.lines.map((line) => (
                  <div key={line.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{line.description}</p>
                      <p className="text-slate-500 mt-0.5">
                        {line.quantity} × {formatCurrency(line.unitPrice)} · Tax: {line.taxRate}%
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(line.lineTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200 text-xs space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(selectedQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Total:</span>
                  <span className="font-medium">{formatCurrency(selectedQuotation.taxTotal)}</span>
                </div>
                {selectedQuotation.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedQuotation.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-brand">
                    {formatCurrency(selectedQuotation.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {selectedQuotation.notes && (
              <div className="text-xs bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Proposal Terms:</span>
                <p className="text-slate-600">{selectedQuotation.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Quotation Creator Modal */}
      <QuotationModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
