'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Plus,
  Bell,
  FileCheck2,
  CreditCard,
  UserPlus,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const { currentUser, invoices } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();

  const handleSignOut = async () => {
    setShowUserMenu(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    router.push('/login');
  };

  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');

  return (
    <header className="h-16 border-b border-sub-border bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-subtle">
      {/* Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sub-muted" />
          <input
            type="text"
            placeholder="Search customers, subscriptions, invoices, or quotations..."
            className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-surface-hover border border-sub-border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sub-base placeholder-sub-muted transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[10px] font-mono bg-white border border-sub-border rounded px-1.5 py-0.5 text-sub-muted shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Production Header Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <Button
            size="sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            icon={<Plus className="h-4 w-4" />}
          >
            Create
          </Button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-sub-border bg-white shadow-elevated p-1.5 z-50 animate-in fade-in-50 duration-150">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-sub-muted uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5 pt-1 text-xs font-medium">
                <Link
                  href="/quotations?action=new"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover text-sub-base hover:text-brand transition-colors"
                >
                  <FileCheck2 className="h-4 w-4 text-sub-muted" />
                  <span>New Quotation</span>
                </Link>
                <Link
                  href="/payments?action=record"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover text-sub-base hover:text-brand transition-colors"
                >
                  <CreditCard className="h-4 w-4 text-sub-muted" />
                  <span>Record Payment</span>
                </Link>
                <Link
                  href="/customers?action=new"
                  onClick={() => setShowQuickCreate(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover text-sub-base hover:text-brand transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-sub-muted" />
                  <span>Add Customer</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-sub-border hover:bg-surface-hover text-sub-muted relative transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {overdueInvoices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-sub-border bg-white shadow-elevated p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-sub-border/60">
                <span className="text-xs font-bold text-sub-base">Notifications</span>
                {overdueInvoices.length > 0 && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                    {overdueInvoices.length} alert{overdueInvoices.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="pt-2 space-y-2">
                {overdueInvoices.length === 0 ? (
                  <p className="text-xs text-sub-muted py-3 text-center">No unread notifications.</p>
                ) : (
                  overdueInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices?status=OVERDUE`}
                      onClick={() => setShowNotifications(false)}
                      className="block p-2 rounded-lg bg-rose-50/70 border border-rose-100 hover:bg-rose-100/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-900">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-rose-600 font-bold">OVERDUE</span>
                      </div>
                      <p className="text-[11px] text-sub-base mt-0.5">
                        {inv.customerName} has an unsettled balance.
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-sub-border" />

        {/* Production User Profile & Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
              {currentUser.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-sub-base leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-sub-muted font-medium mt-1 leading-none uppercase tracking-wider">
                {currentUser.role === 'ADMIN' ? 'Administrator' : 'Staff'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-sub-muted" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-sub-border bg-white shadow-elevated p-2 z-50 animate-in fade-in-50 duration-150">
              <div className="p-2 border-b border-sub-border/60">
                <p className="text-xs font-semibold text-sub-base">{currentUser.name}</p>
                <p className="text-[11px] text-sub-muted truncate mt-0.5">{currentUser.email}</p>
                <span className="inline-block mt-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-sub-base border border-sub-border">
                  {currentUser.role === 'ADMIN' ? 'Administrator' : 'Internal Staff'}
                </span>
              </div>
              <div className="pt-1 space-y-0.5 text-xs text-sub-base">
                <Link
                  href="/staff"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <User className="h-4 w-4 text-sub-muted" />
                  <span>Team & Profile</span>
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <Settings className="h-4 w-4 text-sub-muted" />
                  <span>Preferences & Taxes</span>
                </Link>
                <div className="border-t border-sub-border/60 my-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
