import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reason = body.reason || 'Paused per customer request';
    const actor = body.actor || 'Staff';
    const expectedResumeDate = body.expectedResumeDate ? new Date(body.expectedResumeDate) : null;

    const result = await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({
        where: { id },
        include: { plan: true },
      });

      if (!sub) throw new Error('Subscription not found');
      if (sub.plan && !sub.plan.allowPause) {
        throw new Error('Pause is not permitted under this subscription plan lifecycle rules.');
      }

      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          pauseDate: new Date(),
          resumeExpectedDate: expectedResumeDate,
          events: {
            create: {
              eventType: 'PAUSED',
              actor,
              note: `Subscription paused: ${reason} (Target resume: ${expectedResumeDate ? expectedResumeDate.toISOString().split('T')[0] : 'Open'})`,
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
