import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.discount.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.minAmount !== undefined && { minAmount: body.minAmount }),
        ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit }),
        ...(body.status && { status: body.status }),
      },
    });
    return NextResponse.json(toPlain(updated));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.discount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
