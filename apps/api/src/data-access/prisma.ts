import { PrismaClient } from '@prisma/client';
import { logger } from '@/config/logger';
import { env } from '@/config/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    // Performance optimizations
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Connection pooling configuration
    __internal: {
      engine: {
        // Enable connection pooling
        connectionLimit: env.PRISMA_CONNECTION_POOL_SIZE,
        // Query timeout
        queryTimeout: env.PRISMA_QUERY_TIMEOUT,
        // Binary cache for better performance
        binaryTargets: ['native'],
      },
    },
    // Enable query batching
    transactionOptions: {
      timeout: env.PRISMA_QUERY_TIMEOUT,
      maxWait: 5000, // Maximum time to wait for a connection
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Type-safe event logging for Prisma
type PrismaQueryEvent = {
  query: string;
  params: string;
  duration: number;
  target: string;
};

type PrismaLogEvent = {
  message: string;
  target: string;
};

(prisma as any).$on('query', (e: PrismaQueryEvent) => {
  logger.debug({
    query: e.query,
    params: e.params,
    duration: e.duration,
    target: e.target,
    type: 'prisma-query',
  });
});

(prisma as any).$on('error', (e: PrismaLogEvent) => {
  logger.error({
    message: e.message,
    target: e.target,
    type: 'prisma-error',
  });
});

(prisma as any).$on('info', (e: PrismaLogEvent) => {
  logger.info({
    message: e.message,
    target: e.target,
    type: 'prisma-info',
  });
});

(prisma as any).$on('warn', (e: PrismaLogEvent) => {
  logger.warn({
    message: e.message,
    target: e.target,
    type: 'prisma-warn',
  });
});

// Health check function
export async function checkPrismaHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Prisma health check failed',
    });
    return false;
  }
}

// Graceful shutdown function
export async function closePrismaConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info({
      message: 'Prisma connection closed gracefully',
    });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error closing Prisma connection',
    });
  }
}