'use client';

import React, { useState, useEffect } from 'react';
import { Plan, BillingInterval } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, PauseCircle, RefreshCw, XCircle } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: Plan | null;
}

export function PlanModal({ isOpen, onClose, planToEdit }: PlanModalProps) {
  const { addPlan, updatePlan } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(499);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('MONTHLY');
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allowPause, setAllowPause] = useState(true);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [status, setStatus] = useState<Plan['status']>('ACTIVE');

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setDescription(planToEdit.description);
      setPrice(planToEdit.price);
      setBillingInterval(planToEdit.billingInterval);
      setMinQuantity(planToEdit.minQuantity);
      setStartDate(planToEdit.startDate || '');
      setEndDate(planToEdit.endDate || '');
      setAllowPause(planToEdit.allowPause);
      setAllowEarlyClose(planToEdit.allowEarlyClose);
      setAllowRenewal(planToEdit.allowRenewal);
      setAutoClose(planToEdit.autoClose);
      setStatus(planToEdit.status);
    } else {
      setName('');
      setDescription('');
      setPrice(499);
      setBillingInterval('MONTHLY');
      setMinQuantity(1);
      setStartDate('');
      setEndDate('');
      setAllowPause(true);
      setAllowEarlyClose(true);
      setAllowRenewal(true);
      setAutoClose(false);
      setStatus('ACTIVE');
    }
  }, [planToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (planToEdit) {
      updatePlan(planToEdit.id, {
        name,
        description,
        price: Number(price),
        billingInterval,
        minQuantity: Number(minQuantity),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        allowPause,
        allowEarlyClose,
        allowRenewal,
        autoClose,
        status,
      });
    } else {
      addPlan({
        name,
        description,
        price: Number(price),
        billingInterval,
        minQuantity: Number(minQuantity),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        allowPause,
        allowEarlyClose,
        allowRenewal,
        autoClose,
        status,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={planToEdit ? `Edit Plan: ${planToEdit.name}` : 'Configure New Subscription Plan'}
      description="Define plan pricing, billing cadence, and lifecycle permissions enforced by the server."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {planToEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Plan Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Annual"
            />
          </div>
          <Select
            label="Billing Cadence"
            value={billingInterval}
            onChange={(e) => setBillingInterval(e.target.value as BillingInterval)}
            options={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Yearly', value: 'YEARLY' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
            Plan Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key benefits, target customer tier, billing terms..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Base Price ($)"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Min Quantity / Seats"
            type="number"
            min="1"
            required
            value={minQuantity}
            onChange={(e) => setMinQuantity(parseInt(e.target.value, 10) || 1)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Plan['status'])}
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Availability Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Availability End Date (Optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Section 2.3 & 5.5: Plan Lifecycle Permission Toggles */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Plan Lifecycle Rules & Enforcement
          </h4>
          <p className="text-xs text-slate-500">
            Configure subscription lifecycle actions permitted for customers subscribed to this plan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={allowPause}
                onChange={(e) => setAllowPause(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">Allow Pause</p>
                <p className="text-[11px] text-slate-500">
                  Customer can temporarily freeze subscription and pause recurring invoices.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={allowEarlyClose}
                onChange={(e) => setAllowEarlyClose(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">Allow Early Close</p>
                <p className="text-[11px] text-slate-500">
                  Permit early termination before contracted term expiration.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={allowRenewal}
                onChange={(e) => setAllowRenewal(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">Allow Renewal</p>
                <p className="text-[11px] text-slate-500">
                  Allow one-click or automated renewal for subsequent billing terms.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">Auto Close on End Date</p>
                <p className="text-[11px] text-slate-500">
                  Automatically change status to Closed without rolling over into new term.
                </p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
