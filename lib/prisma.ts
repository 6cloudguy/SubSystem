import { PrismaClient } from '@prisma/client';

/**
 * Resolves the PostgreSQL connection URL with resilient fallbacks for team development.
 * Automatically injects sslmode=disable for LAN database access.
 */
function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL?.trim();

  // If DATABASE_URL is empty or missing, derive from individual env vars or default to Hackathon LAN server
  if (!url) {
    const host = process.env.DB_HOST || process.env.DB_IP || '192.168.18.180';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || process.env.DB_PASS || 'postgres123';
    const database = process.env.DB_NAME || 'hackathon';
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}?schema=public&sslmode=disable`;
  }

  // Ensure sslmode=disable is present if not otherwise specified to prevent LAN SSL handshake failures
  if (!url.includes('sslmode=')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}sslmode=disable`;
  }

  // Propagate back to process.env for Prisma internal runtime access
  process.env.DATABASE_URL = url;
  return url;
}

const resolvedDbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
