import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { lines: true, events: true } },
        invoices: { include: { lines: true } },
        quotations: { include: { lines: true } },
        payments: true,
      },
    });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(toPlain(customer));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.company && { company: body.company }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress }),
        ...(body.taxId !== undefined && { taxId: body.taxId }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status && { status: body.status }),
        ...(body.totalSpent !== undefined && { totalSpent: body.totalSpent }),
        ...(body.outstandingBalance !== undefined && { outstandingBalance: body.outstandingBalance }),
      },
      include: {
        subscriptions: true,
        invoices: true,
        quotations: true,
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
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
