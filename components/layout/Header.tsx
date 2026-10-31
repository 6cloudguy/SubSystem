'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Bell,
  Database,
  ArrowUpDown,
  FileCheck2,
  CreditCard,
  UserPlus,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export function Header({ onQuickAction }: { onQuickAction?: (action: string) => void }) {
  const { currentUser, setCurrentUser, users, invoices } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);

  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Global Quick Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, subscriptions, invoices, or quotes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100/80 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Environment badge referencing Section 3.3 */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
          <Database className="h-3.5 w-3.5 text-emerald-600" />
          <span>Dev DB: Private LAN</span>
        </div>

        {/* Role Switcher (Admin vs Internal Staff) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
            title="Switch internal user role to preview permissions"
          >
            <span className="text-slate-400">View as:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {currentUser.role === 'ADMIN' ? 'Admin' : 'Staff'}
            </span>
            <ArrowUpDown className="h-3 w-3 text-slate-400 ml-1" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Test Persona
              </div>
              <div className="space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{u.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {u.role === 'ADMIN' ? 'Administrator' : 'Internal Staff'}
                      </p>
                    </div>
                    {currentUser.id === u.id && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            icon={<Plus className="h-4 w-4" />}
          >
            New Action
          </Button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-50">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Create Operational Record
              </div>
              <div className="space-y-0.5 pt-1 text-xs font-medium">
                <Link
                  href="/quotations?action=new"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <FileCheck2 className="h-4 w-4 text-slate-400" />
                  <span>New Quotation</span>
                </Link>
                <Link
                  href="/payments?action=record"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span>Record Payment</span>
                </Link>
                <Link
                  href="/customers?action=new"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-slate-400" />
                  <span>Add Customer</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notification indicator */}
        <div className="relative">
          <button
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 relative transition-colors"
            title={
              overdueInvoices.length > 0
                ? `${overdueInvoices.length} overdue invoices requiring follow-up`
                : 'No pending alerts'
            }
          >
            <Bell className="h-4 w-4" />
            {overdueInvoices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
