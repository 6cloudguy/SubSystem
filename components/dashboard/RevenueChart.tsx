'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/lib/AppContext';

export function RevenueChart() {
  const { invoices, payments, isLoading } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // 1. Determine anchor date dynamically:
    // If the database has records dated in 2026 (or any year/future date),
    // anchor the 6-month window to the latest transaction date.
    let anchorDate = new Date();

    const checkDate = (dStr?: string | Date) => {
      if (!dStr) return;
      const d = new Date(dStr);
      if (!isNaN(d.getTime()) && d.getTime() > anchorDate.getTime()) {
        anchorDate = d;
      }
    };

    invoices.forEach((inv) => checkDate(inv.issueDate));
    payments.forEach((pay) => checkDate(pay.date));

    // 2. Generate 6 consecutive monthly buckets leading up to anchorDate
    const months: { [key: string]: { month: string; invoiced: number; cash: number } } = {};
    const anchorYear = anchorDate.getFullYear();
    const anchorMonth = anchorDate.getMonth();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchorYear, anchorMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[key] = { month: label, invoiced: 0, cash: 0 };
    }

    // Helper to extract YYYY-MM key safely from ISO string or Date
    const getMonthKey = (dateVal: string | Date | undefined) => {
      if (!dateVal) return '';
      if (typeof dateVal === 'string' && /^\d{4}-\d{2}/.test(dateVal)) {
        return dateVal.substring(0, 7);
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    // 3. Aggregate DB invoices
    invoices.forEach((inv) => {
      const key = getMonthKey(inv.issueDate);
      if (months[key]) {
        months[key].invoiced += Number(inv.totalAmount) || 0;
      }
    });

    // 4. Aggregate DB payments
    payments.forEach((pay) => {
      const key = getMonthKey(pay.date);
      if (months[key]) {
        months[key].cash += Number(pay.amount) || 0;
      }
    });

    return Object.values(months);
  }, [invoices, payments]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoiced Revenue vs Cash Received</CardTitle>
            <CardDescription>
              Live database metrics: billed invoices vs settled payments
            </CardDescription>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
            Live Database Data
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-80 pt-4 flex-1">
        {!isMounted || isLoading ? (
          <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
            Loading revenue data...
          </div>
        ) : (
          <div className="w-full h-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar
                  name="Invoiced Total"
                  dataKey="invoiced"
                  fill="#FF6B00"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  name="Cash Collected"
                  dataKey="cash"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
