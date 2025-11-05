import { beforeAll, afterAll } from 'vitest';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

// Set test environment
process.env.NODE_ENV = 'test';

// Override env for testing
Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '3001',
  DATABASE_URL: 'file:./test.db',
  LOG_LEVEL: 'error',
  COMMENTS_CACHE_TTL: '60',
  COMMENTS_REFRESH_INTERVAL: '300',
});

// Remove existing test database
if (existsSync('./test.db')) {
  unlinkSync('./test.db');
}

// Generate test Prisma client
execSync('npx prisma generate --schema=./prisma/schema.test.prisma', {
  cwd: process.cwd(),
  stdio: 'inherit',
});

// Create test Prisma client
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

beforeAll(async () => {
  // Initialize test database
  try {
    await testPrisma.$connect();
    
    // Run migrations using Prisma migrate
    execSync('npx prisma db push --schema=./prisma/schema.test.prisma', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    
    logger.info({
      message: 'Test database initialized',
      env: env.NODE_ENV,
    });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to initialize test database',
    });
  }
});

afterAll(async () => {
  // Cleanup test database
  try {
    await testPrisma.$disconnect();
    
    // Remove test database file
    if (existsSync('./test.db')) {
      unlinkSync('./test.db');
    }
    
    logger.info({
      message: 'Test database cleaned up',
    });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to cleanup test database',
    });
  }
});

export { testPrisma };