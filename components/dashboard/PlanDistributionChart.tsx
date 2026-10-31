'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useApp } from '@/lib/AppContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export function PlanDistributionChart() {
  const { plans, subscriptions } = useApp();

  const data = plans.map((plan) => {
    const count = subscriptions.filter((s) => s.planId === plan.id).length;
    return {
      name: plan.name,
      value: count || plan.subscribersCount || 1,
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Subscriptions by Plan</CardTitle>
        <CardDescription>Live breakdown across active subscription tiers</CardDescription>
      </CardHeader>
      <CardContent className="h-80 flex flex-col items-center justify-center pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} active`, name]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
