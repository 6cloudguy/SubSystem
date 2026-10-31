'use client';

import React, { useState } from 'react';
import { Customer } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Edit2, Building2, Phone, Mail } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';

export function CustomerList() {
  const { customers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search by customer name, company, or email..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Lead', value: 'LEAD' },
                { label: 'Suspended', value: 'SUSPENDED' },
              ]}
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Customer
        </Button>
      </div>

      {/* Customer Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer / Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Invoiced</TableHead>
            <TableHead className="text-right">Balance Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                No customer accounts found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredCustomers.map((cust) => (
              <TableRow key={cust.id} className="cursor-pointer">
                <TableCell onClick={() => setSelectedCustomer(cust)}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                        {cust.name}
                      </p>
                      <p className="text-xs text-slate-500">{cust.company}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => setSelectedCustomer(cust)}>
                  <p className="text-xs text-slate-700 font-medium">{cust.email}</p>
                  <p className="text-[11px] text-slate-400">{cust.phone || '-'}</p>
                </TableCell>
                <TableCell onClick={() => setSelectedCustomer(cust)}>
                  <Badge status={cust.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-slate-800" onClick={() => setSelectedCustomer(cust)}>
                  {formatCurrency(cust.totalSpent)}
                </TableCell>
                <TableCell className="text-right" onClick={() => setSelectedCustomer(cust)}>
                  <span
                    className={`font-semibold text-sm ${
                      cust.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(cust.outstandingBalance)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCustomer(cust);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                      title="Edit Customer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        customerToEdit={editingCustomer}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onEdit={(c) => {
          setSelectedCustomer(null);
          setEditingCustomer(c);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
