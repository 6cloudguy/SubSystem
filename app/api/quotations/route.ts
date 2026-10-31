import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';
import { generateDocNumber } from '@/lib/utils';

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(quotations));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const quotationNumber = body.quotationNumber || generateDocNumber('QT');

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: body.customerId,
        customerName: body.customerName,
        templateName: body.templateName || 'Standard Proposal',
        validityDate: body.validityDate ? new Date(body.validityDate) : new Date(Date.now() + 30 * 86400000),
        status: body.status || 'DRAFT',
        subtotal: body.subtotal || 0,
        taxTotal: body.taxTotal || 0,
        discountTotal: body.discountTotal || 0,
        totalAmount: body.totalAmount || 0,
        notes: body.notes || null,
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
      },
      include: { lines: true },
    });
    return NextResponse.json(toPlain(quotation), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
