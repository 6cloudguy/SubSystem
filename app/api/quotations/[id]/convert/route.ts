import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actor = body.actor || 'Internal Staff';

    const result = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id },
        include: { lines: true, customer: true },
      });

      if (!quotation) {
        throw new Error('Quotation not found');
      }

      const defaultPlan = await tx.plan.findFirst({ where: { status: 'ACTIVE' } });
      if (!defaultPlan) {
        throw new Error('No active plan found to associate with subscription');
      }

      const subscriptionNumber = generateDocNumber('SUB');
      const now = new Date();
      const nextBilling = new Date(now.getTime() + 30 * 86400000);

      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          planId: defaultPlan.id,
          planName: defaultPlan.name,
          billingInterval: defaultPlan.billingInterval,
          startDate: now,
          nextBillingDate: nextBilling,
          paymentTerms: 'Net 30',
          status: 'CONFIRMED',
          totalAmount: quotation.totalAmount,
          lines: {
            create: quotation.lines.map((ql) => ({
              productId: ql.productId,
              variantId: ql.variantId,
              description: ql.description,
              quantity: ql.quantity,
              unitPrice: ql.unitPrice,
              taxRate: ql.taxRate,
              discountAmount: ql.discountAmount,
              lineTotal: ql.lineTotal,
            })),
          },
          events: {
            create: {
              eventType: 'CONFIRMED',
              actor,
              note: `Converted from accepted Quotation ${quotation.quotationNumber}`,
            },
          },
        },
        include: { lines: true, events: true },
      });

      await tx.quotation.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedSubscriptionId: subscription.id,
        },
      });

      return subscription;
    });

    return NextResponse.json(toPlain(result), { status: 201 });
  } catch (error: any) {
    console.error('Convert quotation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
