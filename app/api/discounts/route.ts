import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(toPlain(discounts));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const discount = await prisma.discount.create({
      data: {
        code: body.code.toUpperCase().trim(),
        name: body.name,
        type: body.type || 'PERCENTAGE',
        value: body.value,
        minAmount: body.minAmount || 0,
        validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
        validTo: body.validTo ? new Date(body.validTo) : null,
        usageLimit: body.usageLimit || 100,
        usageCount: 0,
        scope: body.scope || 'ALL',
        status: body.status || 'ACTIVE',
      },
    });
    return NextResponse.json(toPlain(discount), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
