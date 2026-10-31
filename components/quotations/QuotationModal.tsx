'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCurrency, calculateLineTotal } from '@/lib/utils';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

interface DraftLine {
  id: string;
  productId: string;
  variantId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount: number;
  lineTotal: number;
}

export function QuotationModal({ isOpen, onClose, preselectedCustomerId }: QuotationModalProps) {
  const { customers, products, taxRules, addQuotation } = useApp();

  const [customerId, setCustomerId] = useState(preselectedCustomerId || (customers[0]?.id || ''));
  const [templateName, setTemplateName] = useState('');
  const [validityDate, setValidityDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  const [lines, setLines] = useState<DraftLine[]>([
    {
      id: `draft-${Date.now()}-1`,
      productId: products[0]?.id || '',
      description: products[0]?.name || '',
      quantity: 1,
      unitPrice: products[0]?.salesPrice || 0,
      taxRate: taxRules[0]?.rate ?? 0,
      discountAmount: 0,
      lineTotal: products[0]?.salesPrice || 0,
    },
  ]);

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const res = calculateLineTotal(l.quantity, prod.salesPrice, l.taxRate, l.discountAmount);
        return {
          ...l,
          productId: prod.id,
          variantId: undefined,
          description: prod.name,
          unitPrice: prod.salesPrice,
          lineTotal: res.total,
        };
      })
    );
  };

  const handleUpdateLine = (index: number, updates: Partial<DraftLine>) => {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, ...updates };
        const res = calculateLineTotal(
          updated.quantity,
          updated.unitPrice,
          updated.taxRate,
          updated.discountAmount
        );
        updated.lineTotal = res.total;
        return updated;
      })
    );
  };

  const handleAddLine = () => {
    const defaultProd = products[0];
    const initialPrice = defaultProd ? defaultProd.salesPrice : 100;
    const res = calculateLineTotal(1, initialPrice, 8.25, 0);

    setLines([
      ...lines,
      {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: defaultProd?.id || '',
        description: defaultProd?.name || 'Item Description',
        quantity: 1,
        unitPrice: initialPrice,
        taxRate: 8.25,
        discountAmount: 0,
        lineTotal: res.total,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const discountTotal = lines.reduce((acc, l) => acc + Number(l.discountAmount || 0), 0);
  const taxTotal = lines.reduce(
    (acc, l) => acc + ((Math.max(0, l.quantity * l.unitPrice - l.discountAmount) * l.taxRate) / 100),
    0
  );
  const totalAmount = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    await addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      templateName,
      validityDate,
      status: 'DRAFT',
      lines,
      subtotal,
      taxTotal,
      discountTotal,
      totalAmount,
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Create Commercial Quotation"
      description="Prepare proposal line items, taxes, discounts, and terms to save directly to PostgreSQL."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Save Quotation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Customer Account"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={customers.map((c) => ({
              label: `${c.name} (${c.company})`,
              value: c.id,
            }))}
          />
          <Input
            label="Template / Proposal Type"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
          <Input
            label="Quotation Validity Date"
            type="date"
            required
            value={validityDate}
            onChange={(e) => setValidityDate(e.target.value)}
          />
        </div>

        {/* Dynamic Line items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quotation Line Items ({lines.length})
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLine}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Line Item
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-2xs text-xs"
              >
                <div className="col-span-12 sm:col-span-4">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">
                    Product / Description
                  </label>
                  <select
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
                    value={line.productId}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.salesPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5"
                    value={line.quantity}
                    onChange={(e) =>
                      handleUpdateLine(idx, { quantity: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5"
                    value={line.unitPrice}
                    onChange={(e) =>
                      handleUpdateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="col-span-3 sm:col-span-1">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Tax (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full text-xs rounded-md border border-slate-200 p-1.5"
                    value={line.taxRate}
                    onChange={(e) =>
                      handleUpdateLine(idx, { taxRate: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="col-span-3 sm:col-span-2 text-right pr-2">
                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Line Total</label>
                  <span className="font-bold text-slate-900 block pt-1.5">
                    {formatCurrency(line.lineTotal)}
                  </span>
                </div>

                <div className="col-span-12 sm:col-span-1 flex justify-end pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    disabled={lines.length <= 1}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Summary Box */}
          <div className="flex flex-col items-end pt-2 text-xs space-y-1 text-slate-600 pr-2">
            <div className="flex justify-between w-64">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span>Estimated Tax:</span>
              <span className="font-medium">{formatCurrency(taxTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between w-64 text-emerald-600">
                <span>Discounts Applied:</span>
                <span className="font-medium">-{formatCurrency(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-brand">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
            Proposal Notes & Commercial Terms
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment milestones, deliverables, contract stipulations..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </form>
    </Modal>
  );
}
