import { Context, Next } from 'hono';
import { redis } from '@/data-access/redis';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { AppError } from '@/utils/errors';
import { createResponseMeta } from '@/utils/response';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (c: Context) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  message?: string; // Custom error message
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimitService {
  private static instance: RateLimitService;

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  /**
   * Check if request is allowed
   */
  async checkRateLimit(
    key: string,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = options.windowMs;
    const maxRequests = options.maxRequests;
    
    const redisKey = `rate_limit:${key}`;
    const windowStart = now - windowMs;
    
    try {
      const pipeline = redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(redisKey, '-inf', windowStart);
      
      // Count current requests in window
      pipeline.zcard(redisKey);
      
      // Add current request
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(redisKey, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }
      
      const currentCount = (results[1][1] as number) + 1; // +1 for current request
      const remaining = Math.max(0, maxRequests - currentCount);
      const allowed = currentCount <= maxRequests;
      
      // Calculate retry after time if rate limited
      const retryAfter = allowed ? undefined : Math.ceil(windowMs / 1000);
      
      return {
        allowed,
        limit: maxRequests,
        remaining,
        resetTime: now + windowMs,
        retryAfter,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        message: 'Rate limit check error',
      });
      
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    key: string,
    options: RateLimitOptions
  ): Promise<Omit<RateLimitResult, 'retryAfter'>> {
    const now = Date.now();
    const windowMs = options.windowMs;
    const maxRequests = options.maxRequests;
    
    const redisKey = `rate_limit:${key}`;
    const windowStart = now - windowMs;
    
    try {
      const pipeline = redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(redisKey, '-inf', windowStart);
      
      // Count current requests in window
      pipeline.zcard(redisKey);
      
      // Get TTL
      pipeline.ttl(redisKey);
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }
      
      const currentCount = results[1][1] as number;
      const remaining = Math.max(0, maxRequests - currentCount);
      
      return {
        allowed: currentCount < maxRequests,
        limit: maxRequests,
        remaining,
        resetTime: now + windowMs,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        message: 'Rate limit status check error',
      });
      
      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests,
        resetTime: now + windowMs,
      };
    }
  }
}

export const rateLimitService = RateLimitService.getInstance();

/**
 * Rate limiting middleware factory
 */
export function rateLimit(options: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    // Generate rate limit key
    const key = options.keyGenerator 
      ? options.keyGenerator(c)
      : `ip:${c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'}`;
    
    // Check rate limit
    const result = await rateLimitService.checkRateLimit(key, options);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', result.limit.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    if (result.retryAfter) {
      c.header('Retry-After', result.retryAfter.toString());
    }
    
    // Log rate limit events
    if (!result.allowed) {
      logger.warn({
        key,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
        path: c.req.path,
        method: c.req.method,
        userAgent: c.req.header('user-agent'),
        message: 'Rate limit exceeded',
      });
      
      const requestId = c.get('requestContext')?.requestId || 'unknown';
      
      return c.json(
        {
          success: false,
          error: {
            message: options.message || 'Too many requests, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter,
          },
          meta: createResponseMeta(requestId),
        },
        { status: 429 }
      );
    }
    
    await next();
  };
}

/**
 * Predefined rate limiters for different use cases
 */
export const defaultRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});

export const crawlerRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_CRAWLER_MAX_REQUESTS,
  message: 'Too many crawler requests, please try again later.',
  keyGenerator: (c) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';
    return `crawler:${ip}:${Buffer.from(userAgent).toString('base64').substring(0, 16)}`;
  },
});

export const aggressiveRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 20,
  message: 'Aggressive rate limiting applied, please slow down.',
});