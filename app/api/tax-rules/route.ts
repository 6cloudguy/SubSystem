import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPlain } from '@/lib/serialize';

export async function GET() {
  try {
    const rules = await prisma.taxRule.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(toPlain(rules));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rule = await prisma.taxRule.create({
      data: {
        name: body.name,
        rate: body.rate,
        applicability: body.applicability || 'ALL',
        effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : new Date(),
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        status: body.status || 'ACTIVE',
      },
    });
    return NextResponse.json(toPlain(rule), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
