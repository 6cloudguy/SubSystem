'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import {
  LayoutDashboard,
  FileCheck2,
  RefreshCw,
  Receipt,
  CreditCard,
  Users2,
  Package,
  Layers,
  Percent,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'primary' | 'danger';
  adminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, invoices, subscriptions } = useApp();

  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;
  const activeSubsCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

  const navigationItems: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Commercial Workflows',
      items: [
        {
          name: 'Quotations',
          href: '/quotations',
          icon: FileCheck2,
        },
        {
          name: 'Subscriptions',
          href: '/subscriptions',
          icon: RefreshCw,
          badge: activeSubsCount > 0 ? activeSubsCount : undefined,
          badgeVariant: 'primary',
        },
        {
          name: 'Customers',
          href: '/customers',
          icon: Users2,
        },
      ],
    },
    {
      title: 'Billing & Finance',
      items: [
        {
          name: 'Invoices',
          href: '/invoices',
          icon: Receipt,
          badge: overdueCount > 0 ? `${overdueCount} due` : undefined,
          badgeVariant: 'danger',
        },
        {
          name: 'Payments',
          href: '/payments',
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'Catalog & Rules',
      items: [
        {
          name: 'Products & Variants',
          href: '/products',
          icon: Package,
        },
        {
          name: 'Subscription Plans',
          href: '/plans',
          icon: Layers,
        },
        {
          name: 'Taxes & Discounts',
          href: '/pricing',
          icon: Percent,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          name: 'Staff & Roles',
          href: '/staff',
          icon: ShieldCheck,
          adminOnly: true,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-base block leading-none">
            Brightloop
          </span>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mt-1">
            Subscription Ops
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navigationItems.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || currentUser.role === 'ADMIN'
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/' || pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'h-4 w-4 transition-colors',
                            isActive
                              ? 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                            item.badgeVariant === 'danger'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Staff Profile Card at bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 border border-indigo-200">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  currentUser.role === 'ADMIN' ? 'bg-purple-500' : 'bg-emerald-500'
                )}
              />
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-medium">
                {currentUser.role === 'ADMIN' ? 'Administrator' : 'Internal Staff'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
