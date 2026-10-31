'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, customerToEdit }: CustomerModalProps) {
  const { addCustomer, updateCustomer } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    billingAddress: '',
    taxId: '',
    notes: '',
    status: 'ACTIVE' as Customer['status'],
  });

  useEffect(() => {
    if (customerToEdit) {
      setFormData({
        name: customerToEdit.name,
        company: customerToEdit.company,
        email: customerToEdit.email,
        phone: customerToEdit.phone,
        billingAddress: customerToEdit.billingAddress,
        taxId: customerToEdit.taxId || '',
        notes: customerToEdit.notes || '',
        status: customerToEdit.status,
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        billingAddress: '',
        taxId: '',
        notes: '',
        status: 'ACTIVE',
      });
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, formData);
    } else {
      addCustomer(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Edit Customer: ${customerToEdit.name}` : 'Create New Customer Account'}
      description="Manage business profile, billing address, and tax information."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {customerToEdit ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person / Account Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
          />
          <Input
            label="Company Name"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. Acme Corp LLC"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Billing Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="billing@company.com"
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <Input
          label="Billing Address"
          value={formData.billingAddress}
          onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
          placeholder="Street address, city, state, postal code, country"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tax Identification / VAT Number"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            placeholder="e.g. US-123456789 or GB9999999"
          />
          <Select
            label="Account Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Lead', value: 'LEAD' },
              { label: 'Suspended', value: 'SUSPENDED' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
            Internal Staff Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special commercial terms, payment terms preferences, billing requirements..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
      </form>
    </Modal>
  );
}
