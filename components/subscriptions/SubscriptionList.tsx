'use client';

import React, { useState } from 'react';
import { Subscription } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Eye,
  Pause,
  Play,
  RotateCw,
  XOctagon,
  FileText,
  History,
} from 'lucide-react';
import {
  PauseSubscriptionModal,
  RenewSubscriptionModal,
  CloseSubscriptionModal,
} from './SubscriptionLifecycleModals';
import { Modal } from '@/components/ui/Modal';

export function SubscriptionList() {
  const { subscriptions, plans, resumeSubscription, generateRecurringInvoice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [pauseTarget, setPauseTarget] = useState<Subscription | null>(null);
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null);
  const [closeTarget, setCloseTarget] = useState<Subscription | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPlan = (planId: string) => plans.find((p) => p.id === planId);

  const handleGenerateInvoice = async (subId: string) => {
    setIsGeneratingInvoice(subId);
    await generateRecurringInvoice(subId);
    setIsGeneratingInvoice(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <Input
            placeholder="Search by subscription #, customer, or plan..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="w-44 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Paused', value: 'PAUSED' },
                { label: 'Confirmed', value: 'CONFIRMED' },
                { label: 'Closed', value: 'CLOSED' },
              ]}
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subscription #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Plan & Cadence</TableHead>
            <TableHead>Next Billing Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Recurring Value</TableHead>
            <TableHead className="text-right">Lifecycle Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                No subscription records found in database matching your filter.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((sub) => {
              const plan = getPlan(sub.planId);
              const canPause = plan ? plan.allowPause : true;
              const canRenew = plan ? plan.allowRenewal : true;
              const canClose = plan ? plan.allowEarlyClose : true;

              return (
                <TableRow key={sub.id}>
                  <TableCell>
                    <span
                      onClick={() => setSelectedSub(sub)}
                      className="font-semibold text-slate-900 cursor-pointer hover:text-brand transition-colors"
                    >
                      {sub.subscriptionNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800 text-sm">{sub.customerName}</p>
                    <p className="text-[11px] text-slate-400">Terms: {sub.paymentTerms}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700 block">{sub.planName}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {sub.billingInterval}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {formatDate(sub.nextBillingDate)}
                  </TableCell>
                  <TableCell>
                    <Badge status={sub.status} />
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatCurrency(sub.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSub(sub)}
                        icon={<Eye className="h-3.5 w-3.5" />}
                      >
                        Details
                      </Button>

                      {sub.status === 'ACTIVE' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Generate recurring invoice"
                            isLoading={isGeneratingInvoice === sub.id}
                            onClick={() => handleGenerateInvoice(sub.id)}
                            icon={<FileText className="h-3.5 w-3.5 text-brand" />}
                          >
                            Bill
                          </Button>

                          {canPause && (
                            <button
                              onClick={() => setPauseTarget(sub)}
                              title="Pause subscription"
                              className="p-1.5 rounded-lg border border-slate-200 text-amber-600 hover:bg-amber-50"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}

                      {sub.status === 'PAUSED' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => resumeSubscription(sub.id)}
                          icon={<Play className="h-3.5 w-3.5" />}
                        >
                          Resume
                        </Button>
                      )}

                      {sub.status === 'ACTIVE' && canRenew && (
                        <button
                          onClick={() => setRenewTarget(sub)}
                          title="Renew subscription term"
                          className="p-1.5 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {sub.status !== 'CLOSED' && canClose && (
                        <button
                          onClick={() => setCloseTarget(sub)}
                          title="Early close"
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                        >
                          <XOctagon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          size="xl"
          title={`Subscription Details: ${selectedSub.subscriptionNumber}`}
          description={`Customer: ${selectedSub.customerName} · Status: ${selectedSub.status}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Badge status={selectedSub.status} size="md" />
              <Button size="sm" variant="outline" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Plan</span>
                <span className="font-semibold text-slate-900">{selectedSub.planName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Interval</span>
                <span className="font-semibold text-slate-900">{selectedSub.billingInterval}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Start Date</span>
                <span className="font-semibold text-slate-900">{formatDate(selectedSub.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Next Billing</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(selectedSub.nextBillingDate)}
                </span>
              </div>
            </div>

            {/* Billable Lines */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Contracted Billable Lines
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-3 flex items-center justify-between text-xs">
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
            </div>

            {/* Audit Trail Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <History className="h-4 w-4 text-brand" />
                Lifecycle Event Log (Section 4 & 5.5)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedSub.events?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No events logged yet.</p>
                ) : (
                  selectedSub.events?.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{ev.eventType}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(ev.timestamp)}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{ev.note}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Actor: {ev.actor}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Lifecycle Modals */}
      <PauseSubscriptionModal
        subscription={pauseTarget}
        isOpen={!!pauseTarget}
        onClose={() => setPauseTarget(null)}
      />
      <RenewSubscriptionModal
        subscription={renewTarget}
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
      />
      <CloseSubscriptionModal
        subscription={closeTarget}
        isOpen={!!closeTarget}
        onClose={() => setCloseTarget(null)}
      />
    </div>
  );
}
