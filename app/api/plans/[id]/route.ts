import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { subscriptions: true },
    });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    return NextResponse.json(toPlain({ ...plan, subscribersCount: plan.subscriptions.length }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.plan.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.billingInterval && { billingInterval: body.billingInterval }),
        ...(body.minQuantity !== undefined && { minQuantity: body.minQuantity }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.allowPause !== undefined && { allowPause: body.allowPause }),
        ...(body.allowEarlyClose !== undefined && { allowEarlyClose: body.allowEarlyClose }),
        ...(body.allowRenewal !== undefined && { allowRenewal: body.allowRenewal }),
        ...(body.autoClose !== undefined && { autoClose: body.autoClose }),
        ...(body.status && { status: body.status }),
      },
      include: { subscriptions: true },
    });
    return NextResponse.json(toPlain({ ...updated, subscribersCount: updated.subscriptions.length }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.plan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
