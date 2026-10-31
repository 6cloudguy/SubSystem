import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(toPlain(product));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.type && { type: body.type }),
          ...(body.salesPrice !== undefined && { salesPrice: body.salesPrice }),
          ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.status && { status: body.status }),
        },
      });

      if (body.variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (body.variants.length > 0) {
          await tx.productVariant.createMany({
            data: body.variants.map((v: any) => ({
              productId: id,
              name: v.name,
              sku: v.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
              priceAdjustment: v.priceAdjustment || 0,
              finalPrice: v.finalPrice || (Number(body.salesPrice || updated.salesPrice) + Number(v.priceAdjustment || 0)),
              status: v.status || 'ACTIVE',
            })),
          });
        }
      }

      return await tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    });

    return NextResponse.json(toPlain(product));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
