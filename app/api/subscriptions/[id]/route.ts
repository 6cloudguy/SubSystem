import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        lines: true,
        events: { orderBy: { timestamp: 'desc' } },
        invoices: true,
        customer: true,
        plan: true,
      },
    });
    if (!subscription) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    return NextResponse.json(toPlain(subscription));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.paymentTerms && { paymentTerms: body.paymentTerms }),
        ...(body.nextBillingDate && { nextBillingDate: new Date(body.nextBillingDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.pauseDate !== undefined && { pauseDate: body.pauseDate ? new Date(body.pauseDate) : null }),
        ...(body.resumeExpectedDate !== undefined && {
          resumeExpectedDate: body.resumeExpectedDate ? new Date(body.resumeExpectedDate) : null,
        }),
        ...(body.closeReason !== undefined && { closeReason: body.closeReason }),
      },
      include: { lines: true, events: true },
    });
    return NextResponse.json(toPlain(updated));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
