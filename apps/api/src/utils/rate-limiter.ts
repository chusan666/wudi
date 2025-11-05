import { cache } from '@repo/db/redis';
import { config } from '@config/env';
import { logger } from '@config/logger';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimiter {
  private keyPrefix: string;

  constructor(keyPrefix: string = 'rate_limit') {
    this.keyPrefix = keyPrefix;
  }

  async isAllowed(
    identifier: string,
    window: number = config.search.rateLimitWindow,
    maxRequests: number = config.search.rateLimitMax
  ): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - window;

    try {
      const pipeline = cache.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, window);
      
      const results = await pipeline.exec();
      const currentCount = results?.[1]?.[1] as number || 0;
      
      const allowed = currentCount < maxRequests;
      const remaining = Math.max(0, maxRequests - currentCount - (allowed ? 1 : 0));
      const reset = now + window;

      logger.debug('Rate limit check', {
        identifier,
        allowed,
        currentCount,
        maxRequests,
        remaining,
        reset,
      });

      return {
        allowed,
        limit: maxRequests,
        remaining,
        reset,
      };
    } catch (error) {
      logger.error('Rate limiter error', { error, identifier });
      // Fail open - allow the request if rate limiter fails
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: now + window,
      };
    }
  }

  generateKey(ip: string, keyword: string): string {
    return `${ip}:${keyword.toLowerCase().trim()}`;
  }
}

export const rateLimiter = new RateLimiter();