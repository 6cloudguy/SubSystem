import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        lines: true,
        allocations: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(invoices));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceNumber = body.invoiceNumber || generateDocNumber('INV');
    const totalAmount = body.totalAmount || 0;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: body.customerId,
        customerName: body.customerName,
        subscriptionId: body.subscriptionId || null,
        subscriptionNumber: body.subscriptionNumber || null,
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 30 * 86400000),
        status: body.status || 'DRAFT',
        currency: body.currency || 'USD',
        subtotal: body.subtotal || 0,
        taxAmount: body.taxAmount || 0,
        discountAmount: body.discountAmount || 0,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        notes: body.notes || null,
        lines: body.lines && body.lines.length > 0
          ? {
              create: body.lines.map((l: any) => ({
                description: l.description,
                quantity: l.quantity || 1,
                unitPrice: l.unitPrice,
                taxRate: l.taxRate || 0,
                discountAmount: l.discountAmount || 0,
                lineTotal: l.lineTotal,
              })),
            }
          : undefined,
      },
      include: { lines: true, allocations: true },
    });

    return NextResponse.json(toPlain(invoice), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
