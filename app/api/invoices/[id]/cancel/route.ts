import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Cancelled by staff';

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status === 'PAID') throw new Error('Cannot cancel a fully paid invoice');

      const wasCountedInBalance = invoice.status === 'CONFIRMED' || invoice.status === 'OVERDUE';

      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: `${invoice.notes || ''} [Cancelled: ${reason}]`,
        },
        include: { lines: true, allocations: true },
      });

      if (wasCountedInBalance && Number(invoice.balanceDue) > 0) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: {
            outstandingBalance: { decrement: invoice.balanceDue },
          },
        });
      }

      return updated;
    });

    return NextResponse.json(toPlain(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
