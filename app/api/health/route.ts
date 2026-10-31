import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const rawUrl = process.env.DATABASE_URL || '';

  // Safely mask password for diagnostic display
  const maskedUrl = rawUrl.replace(/:([^:@]+)@/, ':****@');

  try {
    // 1. Run raw ping test
    await prisma.$queryRaw`SELECT 1 as ping`;

    // 2. Fetch record counts
    const [
      usersCount,
      customersCount,
      productsCount,
      plansCount,
      subscriptionsCount,
      invoicesCount,
      paymentsCount,
    ] = await Promise.all([
      prisma.user.count().catch(() => -1),
      prisma.customer.count().catch(() => -1),
      prisma.product.count().catch(() => -1),
      prisma.plan.count().catch(() => -1),
      prisma.subscription.count().catch(() => -1),
      prisma.invoice.count().catch(() => -1),
      prisma.payment.count().catch(() => -1),
    ]);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      target: maskedUrl,
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
      counts: {
        users: usersCount,
        customers: customersCount,
        products: productsCount,
        plans: plansCount,
        subscriptions: subscriptionsCount,
        invoices: invoicesCount,
        payments: paymentsCount,
      },
      message: 'PostgreSQL connection verified and syncing normally.',
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('[HealthCheck] Database connection error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        target: maskedUrl,
        latencyMs: `${latencyMs}ms`,
        timestamp: new Date().toISOString(),
        error: error.message || 'Failed to connect to database',
        troubleshooting: [
          'Verify your .env file is in the project root (SubSystem/.env).',
          'Ensure DATABASE_URL="postgresql://postgres:postgres123@192.168.18.180:5432/hackathon?schema=public&sslmode=disable"',
          'Make sure you are connected to the same local Wi-Fi / LAN network.',
          'Run "npx prisma generate" to regenerate the Prisma client.',
        ],
      },
      { status: 503 }
    );
  }
}
