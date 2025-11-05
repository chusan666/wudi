import { PrismaClient } from '@prisma/client';
import { logger } from '@/config/logger';

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