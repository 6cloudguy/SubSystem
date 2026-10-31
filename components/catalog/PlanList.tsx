'use client';

import React, { useState } from 'react';
import { Plan } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Plus, Edit2, CheckCircle2, XCircle, ShieldCheck, Clock } from 'lucide-react';
import { PlanModal } from './PlanModal';

export function PlanList() {
  const { plans } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Recurring Plans & Lifecycle Configurations</h3>
          <p className="text-xs text-slate-500">
            Define pricing models, billing frequencies, and lifecycle constraints.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {plan.description || 'No description provided.'}
                  </CardDescription>
                </div>
                <Badge status={plan.status} size="sm" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  / {plan.billingInterval.toLowerCase()}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex justify-between">
                  <span>Minimum Quantity:</span>
                  <span className="font-semibold text-slate-900">{plan.minQuantity} seat(s)</span>
                </div>
                {plan.startDate && (
                  <div className="flex justify-between">
                    <span>Effective:</span>
                    <span className="font-medium text-slate-800">{plan.startDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Active Subscribers:</span>
                  <span className="font-semibold text-indigo-600">
                    {plan.subscribersCount || 0} customer(s)
                  </span>
                </div>
              </div>

              {/* Lifecycle rule checklist */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Plan Rules (Section 2.3 & 5.5)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {plan.allowPause ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={plan.allowPause ? 'text-slate-700' : 'text-slate-400'}>
                      Pause allowed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.allowEarlyClose ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={plan.allowEarlyClose ? 'text-slate-700' : 'text-slate-400'}>
                      Early close
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.allowRenewal ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={plan.allowRenewal ? 'text-slate-700' : 'text-slate-400'}>
                      Renewal allowed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.autoClose ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={plan.autoClose ? 'text-slate-700' : 'text-slate-400'}>
                      Auto-close
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setEditingPlan(plan);
                  setIsModalOpen(true);
                }}
                icon={<Edit2 className="h-3.5 w-3.5" />}
              >
                Edit Plan & Rules
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        planToEdit={editingPlan}
      />
    </div>
  );
}
