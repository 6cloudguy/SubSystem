import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new Error('Invoice not found');
      if (invoice.status !== 'DRAFT') throw new Error('Only draft invoices can be confirmed');

      const updated = await tx.invoice.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: { lines: true, allocations: true },
      });

      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          outstandingBalance: { increment: invoice.balanceDue },
        },
      });

      return updated;
    });

    return NextResponse.json(toPlain(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
