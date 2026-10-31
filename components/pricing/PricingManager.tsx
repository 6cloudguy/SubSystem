'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Percent, Tag, Edit2 } from 'lucide-react';
import { TaxRule, Discount } from '@/lib/types';

export function PricingManager() {
  const { taxRules, discounts, addTaxRule, addDiscount, updateTaxRule, updateDiscount } = useApp();

  // Tax Rule Modal state
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [taxApplicability, setTaxApplicability] = useState<'ALL' | 'PRODUCTS' | 'SERVICES'>('ALL');

  // Discount Modal state
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discCode, setDiscCode] = useState('');
  const [discName, setDiscName] = useState('');
  const [discType, setDiscType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discValue, setDiscValue] = useState<number>(0);
  const [discMinAmount, setDiscMinAmount] = useState<number>(0);
  const [discUsageLimit, setDiscUsageLimit] = useState<number>(0);
  const [discScope, setDiscScope] = useState<'ALL' | 'SUBSCRIPTIONS' | 'PLANS'>('ALL');

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName) return;
    await addTaxRule({
      name: taxName,
      rate: Number(taxRate),
      applicability: taxApplicability,
      effectiveFrom: new Date().toISOString(),
      status: 'ACTIVE',
    });
    setTaxName('');
    setIsTaxModalOpen(false);
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discCode) return;
    await addDiscount({
      code: discCode.toUpperCase().trim(),
      name: discName || discCode,
      type: discType,
      value: Number(discValue),
      minAmount: Number(discMinAmount),
      validFrom: new Date().toISOString(),
      usageLimit: Number(discUsageLimit),
      scope: discScope,
      status: 'ACTIVE',
    });
    setDiscCode('');
    setDiscName('');
    setIsDiscountModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="taxes">
        <div className="flex items-center justify-between">
          <TabList>
            <TabTrigger value="taxes">Tax Rules ({taxRules.length})</TabTrigger>
            <TabTrigger value="discounts">Discounts & Codes ({discounts.length})</TabTrigger>
          </TabList>
        </div>

        {/* Taxes Tab */}
        <TabContent value="taxes">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Tax Rates & Jurisdictions</h3>
                <p className="text-xs text-slate-500">
                  Configure VAT, GST, or state sales tax automatically applied to invoices.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsTaxModalOpen(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                Add Tax Rule
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tax Name</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead className="text-right">Rate (%)</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRules.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold text-slate-900">{t.name}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {t.applicability}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{t.rate}%</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {formatDate(t.effectiveFrom)}
                    </TableCell>
                    <TableCell>
                      <Badge status={t.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabContent>

        {/* Discounts Tab */}
        <TabContent value="discounts">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">Discounts & Promo Campaigns</h3>
                <p className="text-xs text-slate-500">
                  Fixed or percentage deductions applied to quotations or subscriptions.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsDiscountModalOpen(true)}
                icon={<Plus className="h-4 w-4" />}
              >
                New Discount Code
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promo Code & Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Min Amount</TableHead>
                  <TableHead className="text-right">Usage Count</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <p className="font-mono font-bold text-brand">{d.code}</p>
                      <p className="text-xs text-slate-500">{d.name}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {d.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {d.type === 'PERCENTAGE' ? `${d.value}%` : formatCurrency(d.value)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-600">
                      {formatCurrency(d.minAmount)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-slate-800">
                      {d.usageCount} / {d.usageLimit}
                    </TableCell>
                    <TableCell>
                      <Badge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabContent>
      </Tabs>

      {/* Tax Rule Modal */}
      <Modal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        size="md"
        title="Add Tax Jurisdiction Rule"
        description="Configure tax rates applied automatically during quotation and invoice calculation."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsTaxModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTax}>
              Save Tax Rule
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTax} className="space-y-4">
          <Input
            label="Tax Name"
            required
            value={taxName}
            onChange={(e) => setTaxName(e.target.value)}
            placeholder="e.g. State Sales Tax (Standard)"
          />
          <Input
            label="Rate Percentage (%)"
            type="number"
            step="0.01"
            min="0"
            required
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
          <Select
            label="Applicability Scope"
            value={taxApplicability}
            onChange={(e) =>
              setTaxApplicability(e.target.value as 'ALL' | 'PRODUCTS' | 'SERVICES')
            }
            options={[
              { label: 'All Catalog Items', value: 'ALL' },
              { label: 'Products Only', value: 'PRODUCTS' },
              { label: 'Services Only', value: 'SERVICES' },
            ]}
          />
        </form>
      </Modal>

      {/* Discount Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        size="md"
        title="Create Discount Code"
        description="Define discount values, minimum purchase constraints, and usage limits."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDiscountModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateDiscount}>
              Create Discount
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDiscount} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Promo Code"
              required
              value={discCode}
              onChange={(e) => setDiscCode(e.target.value.toUpperCase())}
              placeholder="e.g. ENTERPRISE20"
            />
            <Select
              label="Discount Type"
              value={discType}
              onChange={(e) => setDiscType(e.target.value as 'PERCENTAGE' | 'FIXED')}
              options={[
                { label: 'Percentage (%)', value: 'PERCENTAGE' },
                { label: 'Fixed Amount ($)', value: 'FIXED' },
              ]}
            />
          </div>
          <Input
            label="Campaign / Description Name"
            value={discName}
            onChange={(e) => setDiscName(e.target.value)}
            placeholder="e.g. Enterprise Q4 Promotional Incentive"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Discount Value (${discType === 'PERCENTAGE' ? '%' : '$'})`}
              type="number"
              step="0.01"
              required
              value={discValue}
              onChange={(e) => setDiscValue(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Minimum Order Subtotal ($)"
              type="number"
              value={discMinAmount}
              onChange={(e) => setDiscMinAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <Input
            label="Usage Limit"
            type="number"
            value={discUsageLimit}
            onChange={(e) => setDiscUsageLimit(parseInt(e.target.value, 10) || 100)}
          />
        </form>
      </Modal>
    </div>
  );
}
