import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        lines: true,
        events: { orderBy: { timestamp: 'desc' } },
        invoices: true,
        customer: true,
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(subscriptions));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subNumber = body.subscriptionNumber || generateDocNumber('SUB');

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber: subNumber,
        customerId: body.customerId,
        customerName: body.customerName,
        planId: body.planId,
        planName: body.planName,
        billingInterval: body.billingInterval || 'MONTHLY',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : new Date(Date.now() + 30 * 86400000),
        paymentTerms: body.paymentTerms || 'Net 30',
        status: body.status || 'ACTIVE',
        totalAmount: body.totalAmount,
        lines: body.lines && body.lines.length > 0
          ? {
              create: body.lines.map((l: any) => ({
                productId: l.productId || null,
                variantId: l.variantId || null,
                description: l.description,
                quantity: l.quantity || 1,
                unitPrice: l.unitPrice,
                taxRate: l.taxRate || 0,
                discountAmount: l.discountAmount || 0,
                lineTotal: l.lineTotal,
              })),
            }
          : undefined,
        events: {
          create: {
            eventType: 'CREATED',
            actor: body.actor || 'Staff',
            note: 'Subscription created in database.',
          },
        },
      },
      include: {
        lines: true,
        events: true,
      },
    });

    return NextResponse.json(toPlain(subscription), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
