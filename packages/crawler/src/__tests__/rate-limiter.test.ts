import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../utils/rate-limiter.js';
import { RateLimitError } from '../types/index.js';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });
  });

  it('should allow requests within limit', async () => {
    await expect(rateLimiter.acquire()).resolves.toBeUndefined();
    await expect(rateLimiter.acquire()).resolves.toBeUndefined();
    await expect(rateLimiter.acquire()).resolves.toBeUndefined();
  });

  it('should throw RateLimitError when limit exceeded', async () => {
    await rateLimiter.acquire();
    await rateLimiter.acquire();
    await rateLimiter.acquire();

    await expect(rateLimiter.acquire()).rejects.toThrow(RateLimitError);
  });

  it('should reset after time window', async () => {
    await rateLimiter.acquire();
    await rateLimiter.acquire();
    await rateLimiter.acquire();

    await new Promise((resolve) => setTimeout(resolve, 1100));

    await expect(rateLimiter.acquire()).resolves.toBeUndefined();
  });

  it('should report correct stats', async () => {
    await rateLimiter.acquire();
    await rateLimiter.acquire();

    const stats = rateLimiter.getStats();
    expect(stats.current).toBe(2);
    expect(stats.max).toBe(3);
    expect(stats.windowMs).toBe(1000);
  });

  it('should reset correctly', async () => {
    await rateLimiter.acquire();
    await rateLimiter.acquire();

    rateLimiter.reset();

    const stats = rateLimiter.getStats();
    expect(stats.current).toBe(0);
  });
});
