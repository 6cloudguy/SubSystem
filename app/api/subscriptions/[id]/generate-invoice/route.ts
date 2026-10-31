import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actor = body.actor || 'Staff';

    const result = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({
        where: { id },
        include: { lines: true, customer: true },
      });

      if (!sub) throw new Error('Subscription not found');

      const invoiceNumber = generateDocNumber('INV');
      const now = new Date();
      const dueDate = new Date(now.getTime() + 30 * 86400000);

      const subtotal = sub.lines.reduce((acc, l) => acc + Number(l.quantity) * Number(l.unitPrice), 0);
      const taxAmount = sub.lines.reduce(
        (acc, l) => acc + (Number(l.quantity) * Number(l.unitPrice) * Number(l.taxRate)) / 100,
        0
      );
      const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          customerName: sub.customerName,
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          issueDate: now,
          dueDate,
          status: 'CONFIRMED',
          currency: 'USD',
          subtotal,
          taxAmount,
          discountAmount: 0,
          totalAmount,
          amountPaid: 0,
          balanceDue: totalAmount,
          notes: `Recurring billing for ${sub.subscriptionNumber}. Terms: ${sub.paymentTerms}`,
          lines: {
            create: sub.lines.map((l) => ({
              description: `${l.description} (${sub.billingInterval})`,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              taxRate: l.taxRate,
              discountAmount: l.discountAmount,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.customer.update({
        where: { id: sub.customerId },
        data: {
          outstandingBalance: {
            increment: totalAmount,
          },
        },
      });

      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: sub.id,
          eventType: 'INVOICED',
          actor,
          note: `Generated recurring invoice ${invoiceNumber} for $${totalAmount.toFixed(2)}`,
        },
      });

      return invoice;
    });

    return NextResponse.json(toPlain(result), { status: 201 });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
