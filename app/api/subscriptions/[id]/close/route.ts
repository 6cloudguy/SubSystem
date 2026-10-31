import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actor = body.actor || 'Staff';
    const reason = body.reason || 'Early termination requested';

    const result = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({
        where: { id },
        include: { plan: true },
      });

      if (!sub) throw new Error('Subscription not found');
      if (sub.plan && !sub.plan.allowEarlyClose) {
        throw new Error('Early close is not permitted under this plan lifecycle rules.');
      }

      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closeReason: reason,
          events: {
            create: {
              eventType: 'CLOSED',
              actor,
              note: `Subscription closed: ${reason}`,
            },
          },
        },
        include: { lines: true, events: { orderBy: { timestamp: 'desc' } } },
      });

      return updated;
    });

    return NextResponse.json(toPlain(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
