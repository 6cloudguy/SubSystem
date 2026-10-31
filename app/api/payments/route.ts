import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        allocations: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(payments));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentNumber = body.paymentNumber || generateDocNumber('PAY');
    const amount = Number(body.amount);
    const customerId = body.customerId;
    const allocations: { invoiceId: string; amount: number }[] = body.allocations || [];

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          date: body.date ? new Date(body.date) : new Date(),
          customerId,
          customerName: body.customerName,
          amount,
          method: body.method || 'BANK_TRANSFER',
          reference: body.reference || `REF-${Date.now()}`,
          status: 'COMPLETED',
          notes: body.notes || null,
        },
      });

      // 2. Process allocations
      for (const alloc of allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (!inv) continue;

        const allocAmount = Number(alloc.amount);
        const newAmountPaid = Number(inv.amountPaid) + allocAmount;
        const newBalanceDue = Math.max(0, Number(inv.totalAmount) - newAmountPaid);
        const newStatus = newBalanceDue <= 0.01 ? 'PAID' : inv.status;

        // Create allocation row
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            allocatedAmount: allocAmount,
          },
        });

        // Update invoice balance and status
        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
          },
        });
      }

      // 3. Update customer totalSpent and outstandingBalance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: amount },
          outstandingBalance: { decrement: amount },
        },
      });

      return await tx.payment.findUnique({
        where: { id: payment.id },
        include: { allocations: true, customer: true },
      });
    });

    return NextResponse.json(toPlain(result), { status: 201 });
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
