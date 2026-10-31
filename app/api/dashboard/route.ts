import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const [
      customersCount,
      activeSubs,
      allInvoices,
      allPayments,
      plansWithSubs,
      overdueInvoices,
      recentEvents,
      recentPayments,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.subscription.findMany({ where: { status: 'ACTIVE' } }),
      prisma.invoice.findMany(),
      prisma.payment.findMany(),
      prisma.plan.findMany({
        include: { subscriptions: { where: { status: 'ACTIVE' } } },
      }),
      prisma.invoice.findMany({
        where: { status: 'OVERDUE' },
        include: { customer: true },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.subscriptionEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { subscription: true },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { date: 'desc' },
      }),
    ]);

    // Calculate MRR
    const totalMonthlyRevenue = activeSubs.reduce((sum, s) => {
      const val = Number(s.totalAmount);
      if (s.billingInterval === 'MONTHLY') return sum + val;
      if (s.billingInterval === 'YEARLY') return sum + val / 12;
      if (s.billingInterval === 'WEEKLY') return sum + val * 4.33;
      if (s.billingInterval === 'DAILY') return sum + val * 30;
      return sum + val;
    }, 0);

    const cashReceived = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoiced = allInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const totalOutstandingBalance = allInvoices
      .filter((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + Number(i.balanceDue), 0);

    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + Number(i.balanceDue), 0);

    // Plan distribution
    const planDistribution = plansWithSubs.map((p) => ({
      name: p.name,
      value: p.subscriptions.length,
    }));

    const response = {
      metrics: {
        activeSubscriptionsCount: activeSubs.length,
        totalMonthlyRevenue: Math.round(totalMonthlyRevenue * 100) / 100,
        cashReceivedThisMonth: Math.round(cashReceived * 100) / 100,
        invoicedThisMonth: Math.round(invoiced * 100) / 100,
        totalOutstandingBalance: Math.round(totalOutstandingBalance * 100) / 100,
        overdueInvoicesCount: overdueInvoices.length,
        overdueAmount: Math.round(overdueAmount * 100) / 100,
        customersCount,
      },
      planDistribution,
      overdueInvoices,
      recentEvents,
      recentPayments,
    };

    return NextResponse.json(toPlain(response));
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
