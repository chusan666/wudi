import { PrismaClient } from '@prisma/client';
import { logger } from '@config/logger';
import { DatabaseError } from '@utils/errors';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development
const prisma = globalThis.__prisma || new PrismaClient({
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

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Event listeners for logging
prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query);
  logger.debug('Params: ' + e.params);
  logger.debug('Duration: ' + e.duration + 'ms');
});

prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Database info:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };

// Helper function to handle database errors
export function handleDatabaseError(error: any): never {
  logger.error('Database operation failed:', error);
  
  if (error.code === 'P2002') {
    throw new DatabaseError('Unique constraint violation', { field: error.meta?.target });
  }
  
  if (error.code === 'P2025') {
    throw new DatabaseError('Record not found', { cause: error.message });
  }
  
  if (error.code === 'P2003') {
    throw new DatabaseError('Foreign key constraint violation', { field: error.meta?.field_name });
  }
  
  throw new DatabaseError('Database operation failed', { originalError: error.message });
}