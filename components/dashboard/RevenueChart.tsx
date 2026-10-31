'use client';

import React from 'react';
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

const monthlyData = [
  { month: 'May 26', invoiced: 2800, cash: 2600 },
  { month: 'Jun 26', invoiced: 3400, cash: 3100 },
  { month: 'Jul 26', invoiced: 4100, cash: 3900 },
  { month: 'Aug 26', invoiced: 5200, cash: 4800 },
  { month: 'Sep 26', invoiced: 6100, cash: 5400 },
  { month: 'Oct 26', invoiced: 8249, cash: 6099 },
];

export function RevenueChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invoiced Revenue vs Cash Received</CardTitle>
            <CardDescription>
              Compares billed amounts against settled cash collections (Section 2.6 specification)
            </CardDescription>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
            Past 6 Months
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-80 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
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
              fill="#6366f1"
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
