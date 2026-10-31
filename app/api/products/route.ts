import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(toPlain(products));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        type: body.type || 'SOFTWARE',
        salesPrice: body.salesPrice,
        costPrice: body.costPrice || 0,
        notes: body.notes || null,
        status: body.status || 'ACTIVE',
        variants: body.variants && body.variants.length > 0
          ? {
              create: body.variants.map((v: any) => ({
                name: v.name,
                sku: v.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
                priceAdjustment: v.priceAdjustment || 0,
                finalPrice: v.finalPrice || (Number(body.salesPrice) + Number(v.priceAdjustment || 0)),
                status: v.status || 'ACTIVE',
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });
    return NextResponse.json(toPlain(product), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
