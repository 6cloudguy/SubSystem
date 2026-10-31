import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function serializeDecimals(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'object' && typeof data.toNumber === 'function') {
    return data.toNumber();
  }
  if (Array.isArray(data)) {
    return data.map(serializeDecimals);
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (typeof data === 'object') {
    const copy: any = {};
    for (const key of Object.keys(data)) {
      copy[key] = serializeDecimals(data[key]);
    }
    return copy;
  }
  return data;
}

export async function GET() {
  try {
    const [
      users,
      customers,
      products,
      plans,
      quotations,
      subscriptions,
      invoices,
      payments,
      taxRules,
      discounts,
    ] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.customer.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: 'desc' } }),
      prisma.plan.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.quotation.findMany({ include: { lines: true }, orderBy: { createdAt: 'desc' } }),
      prisma.subscription.findMany({ include: { lines: true, events: true }, orderBy: { createdAt: 'desc' } }),
      prisma.invoice.findMany({ include: { lines: true, allocations: true }, orderBy: { createdAt: 'desc' } }),
      prisma.payment.findMany({ include: { allocations: true }, orderBy: { createdAt: 'desc' } }),
      prisma.taxRule.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.discount.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json(
      serializeDecimals({
        source: 'PostgreSQL - hackathon database (192.168.18.180)',
        users,
        customers,
        products,
        plans,
        quotations,
        subscriptions,
        invoices,
        payments,
        taxRules,
        discounts,
      })
    );
  } catch (error: any) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from database', details: error.message },
      { status: 500 }
    );
  }
}

