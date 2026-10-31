import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const actor = body.actor || 'Staff';
    const note = body.note || 'Subscription resumed and reinstated.';

    const result = await prisma.subscription.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        pauseDate: null,
        resumeExpectedDate: null,
        events: {
          create: {
            eventType: 'RESUMED',
            actor,
            note,
          },
        },
      },
      include: { lines: true, events: { orderBy: { timestamp: 'desc' } } },
    });

    return NextResponse.json(toPlain(result));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
