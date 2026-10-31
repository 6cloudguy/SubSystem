'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useApp } from '@/lib/AppContext';

const COLORS = ['#FF6B00', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'];

export function PlanDistributionChart() {
  const { plans, subscriptions, isLoading } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!plans || plans.length === 0) return [];

    return plans
      .map((plan) => {
        const count = subscriptions.filter(
          (s) => s.planId === plan.id || s.planName?.toLowerCase() === plan.name?.toLowerCase()
        ).length;

        return {
          name: plan.name,
          value: count > 0 ? count : (plan.subscribersCount || 0),
        };
      })
      .filter((d) => d.value > 0);
  }, [plans, subscriptions]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Subscriptions by Plan</CardTitle>
        <CardDescription>Live breakdown across active subscription tiers</CardDescription>
      </CardHeader>
      <CardContent className="h-80 pt-2 flex-1">
        {!isMounted || isLoading ? (
          <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
            Loading plan distribution...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6">
            <p>No active subscriptions in database yet.</p>
          </div>
        ) : (
          <div className="w-full h-full min-w-0">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
