'use client';

import React, { useMemo } from 'react';
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
  const { invoices, payments } = useApp();

  const chartData = useMemo(() => {
    // Generate past 6 months
    const months: { [key: string]: { month: string; invoiced: number; cash: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months[key] = { month: label, invoiced: 0, cash: 0 };
    }

    // Aggregate DB invoices
    invoices.forEach((inv) => {
      if (!inv.issueDate) return;
      const key = inv.issueDate.substring(0, 7);
      if (months[key]) {
        months[key].invoiced += Number(inv.totalAmount) || 0;
      }
    });

    // Aggregate DB payments
    payments.forEach((pay) => {
      if (!pay.date) return;
      const key = pay.date.substring(0, 7);
      if (months[key]) {
        months[key].cash += Number(pay.amount) || 0;
      }
    });

    return Object.values(months);
  }, [invoices, payments]);

  return (
    <Card className="h-full">
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
      <CardContent className="h-80 pt-4">
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
      </CardContent>
    </Card>
  );
}
