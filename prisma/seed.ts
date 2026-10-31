import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // All application data is persisted and managed directly in the live PostgreSQL database.
  // No hardcoded data is maintained in the application codebase.
  const isConnected = await prisma.$queryRaw`SELECT 1 as connected`;
  if (isConnected) {
    console.log('[Seed] Live PostgreSQL database verified. No static seed data required.');
  }
}

main()
  .catch((e) => {
    console.error('[Seed] Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
