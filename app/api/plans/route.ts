import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        subscriptions: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const transformed = plans.map((p) => ({
      ...p,
      subscribersCount: p.subscriptions.length,
    }));

    return NextResponse.json(toPlain(transformed));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: body.price,
        billingInterval: body.billingInterval || 'MONTHLY',
        minQuantity: body.minQuantity || 1,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        allowPause: body.allowPause !== undefined ? body.allowPause : true,
        allowEarlyClose: body.allowEarlyClose !== undefined ? body.allowEarlyClose : true,
        allowRenewal: body.allowRenewal !== undefined ? body.allowRenewal : true,
        autoClose: body.autoClose !== undefined ? body.autoClose : false,
        status: body.status || 'ACTIVE',
      },
    });
    return NextResponse.json(toPlain({ ...plan, subscribersCount: 0 }), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
