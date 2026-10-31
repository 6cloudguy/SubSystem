import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        subscriptions: true,
        invoices: true,
        quotations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(customers));
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone || '',
        billingAddress: body.billingAddress || '',
        taxId: body.taxId || null,
        notes: body.notes || null,
        status: body.status || 'ACTIVE',
        totalSpent: 0,
        outstandingBalance: 0,
      },
      include: {
        subscriptions: true,
        invoices: true,
        quotations: true,
      },
    });
    return NextResponse.json(toPlain(customer), { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}
