import { beforeAll } from 'vitest';
import { config } from '@config/env';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.LOG_LEVEL = 'error';

beforeAll(async () => {
  // Initialize test environment
  console.log('Test environment initialized');
});