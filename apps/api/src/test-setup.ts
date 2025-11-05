import { vi } from 'vitest';
import { env } from '@config/env';

// Mock environment variables for tests
vi.mock('@config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3001,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379/1',
    CRAWLER_CONCURRENT_REQUESTS: 1,
    CRAWLER_REQUEST_DELAY: 100,
    CRAWLER_TIMEOUT: 5000,
    API_RATE_LIMIT_WINDOW: 60000,
    API_RATE_LIMIT_MAX: 1000,
    CACHE_TTL_PROFILE: 60,
    CACHE_TTL_PRICING: 30,
    CACHE_TTL_AUDIENCE: 60,
    CACHE_TTL_PERFORMANCE: 30,
    CACHE_TTL_CONVERSION: 60,
    CACHE_TTL_MARKETING_INDEX: 15,
  },
}));

// Mock logger for tests
vi.mock('@config/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));