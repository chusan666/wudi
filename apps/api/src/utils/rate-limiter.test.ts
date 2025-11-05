import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimiter } from '@utils/rate-limiter';

// Mock Redis cache
vi.mock('@repo/db/redis', () => ({
  cache: {
    pipeline: vi.fn(() => ({
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    })),
  },
}));

vi.mock('@config/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow requests within limits', async () => {
    const identifier = '192.168.1.1:test';
    
    const { cache } = await import('@repo/db/redis');
    vi.mocked(cache.pipeline().exec).mockResolvedValue([
      null, // zremrangebyscore result
      [null, 5], // zcard result (5 current requests)
      null, // zadd result
      null, // expire result
    ]);

    const result = await rateLimiter.isAllowed(identifier, 60, 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 10 - 5 - 1 (current request)
    expect(result.limit).toBe(10);
  });

  it('should deny requests exceeding limits', async () => {
    const identifier = '192.168.1.1:test';
    
    const { cache } = await import('@repo/db/redis');
    vi.mocked(cache.pipeline().exec).mockResolvedValue([
      null, // zremrangebyscore result
      [null, 10], // zcard result (10 current requests, at limit)
      null, // zadd result
      null, // expire result
    ]);

    const result = await rateLimiter.isAllowed(identifier, 60, 10);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(10);
  });

  it('should generate consistent keys', () => {
    const key1 = rateLimiter.generateKey('192.168.1.1', 'Test Query');
    const key2 = rateLimiter.generateKey('192.168.1.1', 'test query');
    const key3 = rateLimiter.generateKey('192.168.1.2', 'Test Query');

    expect(key1).toBe(key2); // Should be case insensitive and trimmed
    expect(key1).not.toBe(key3); // Different IP should generate different key
  });

  it('should fail open on Redis errors', async () => {
    const identifier = '192.168.1.1:test';
    
    const { cache } = await import('@repo/db/redis');
    vi.mocked(cache.pipeline().exec).mockRejectedValue(new Error('Redis connection failed'));

    const result = await rateLimiter.isAllowed(identifier, 60, 10);

    expect(result.allowed).toBe(true); // Should allow request on error
    expect(result.remaining).toBe(9); // maxRequests - 1
  });
});