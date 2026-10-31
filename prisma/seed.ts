import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Verifying system baseline...');

  // 1. Ensure at least one system administrator exists
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount === 0) {
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@BrightLoop2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@brightloop.io',
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash,
      },
    });
    console.log('[Seed] Created default administrator account: admin@brightloop.io');
  }

  // 2. Ensure standard subscription plans exist if catalog is uninitialized
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: 'Professional Monthly',
          description: 'Full platform access with monthly billing cycle',
          price: 499,
          billingInterval: 'MONTHLY',
          minQuantity: 1,
          allowPause: true,
          allowEarlyClose: true,
          allowRenewal: true,
          autoClose: false,
          status: 'ACTIVE',
        },
        {
          name: 'Enterprise Annual',
          description: 'Enterprise tier with dedicated support and annual billing',
          price: 4999,
          billingInterval: 'YEARLY',
          minQuantity: 1,
          allowPause: true,
          allowEarlyClose: true,
          allowRenewal: true,
          autoClose: false,
          status: 'ACTIVE',
        },
      ],
    });
    console.log('[Seed] Initialized standard subscription tiers.');
  }

  // 3. Ensure a baseline tax rule exists
  const taxCount = await prisma.taxRule.count();
  if (taxCount === 0) {
    await prisma.taxRule.create({
      data: {
        name: 'Standard VAT / Sales Tax',
        rate: 8.25,
        applicability: 'ALL',
        effectiveFrom: new Date(),
        status: 'ACTIVE',
      },
    });
    console.log('[Seed] Initialized baseline tax rule.');
  }

  console.log('[Seed] Database initialization verified.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
