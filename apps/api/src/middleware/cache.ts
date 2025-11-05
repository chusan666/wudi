import { Context, Next } from 'hono';
import { redisClient } from '@data-access/redis';
import { logger } from '@config/logger';
import { env } from '@config/env';
import { CacheError } from '@utils/errors';

export interface CacheOptions {
  ttl?: number;
  key?: string;
  skipCache?: boolean;
  tags?: string[];
}

export function cache(options: CacheOptions = {}) {
  return async (c: Context, next: Next) => {
    if (options.skipCache) {
      await next();
      return;
    }

    const requestContext = c.get('requestContext');
    const cacheKey = options.key || generateCacheKey(c);
    
    try {
      // Try to get from cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const ttl = await redisClient.getTtl(cacheKey);
        
        logger.debug('Cache hit', {
          requestId: requestContext?.id,
          cacheKey,
          ttl,
        });

        return c.json({
          ...cached,
          meta: {
            ...cached.meta,
            cache: {
              hit: true,
              ttl: ttl > 0 ? ttl : undefined,
            },
          },
        });
      }

      logger.debug('Cache miss', {
        requestId: requestContext?.id,
        cacheKey,
      });

      // Execute request
      await next();

      // Cache successful responses
      if (c.res.status === 200 && options.ttl) {
        const responseData = await c.res.json();
        await redisClient.set(cacheKey, responseData, options.ttl);
        
        logger.debug('Response cached', {
          requestId: requestContext?.id,
          cacheKey,
          ttl: options.ttl,
        });
      }
    } catch (error) {
      if (error instanceof CacheError) {
        logger.error('Cache error, proceeding without cache', {
          requestId: requestContext?.id,
          error: error.message,
        });
      } else {
        logger.error('Unexpected cache error', {
          requestId: requestContext?.id,
          error,
        });
      }
      
      // Continue without cache
      await next();
    }
  };
}

function generateCacheKey(c: Context): string {
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;
  const search = new URL(c.req.url).search;
  
  return `${method}:${path}${search}`;
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    await redisClient.invalidatePattern(pattern);
  } catch (error) {
    logger.error('Cache invalidation failed', { pattern, error });
    throw new CacheError('Failed to invalidate cache', { pattern });
  }
}

// Cache middleware for KOL endpoints
export function kolCache(endpointType: string, ttl?: number) {
  const defaultTtl = getDefaultTtl(endpointType);
  
  return cache({
    ttl: ttl || defaultTtl,
    key: (c: Context) => {
      const kolId = c.req.param('id');
      const search = new URL(c.req.url).search;
      return `kol:${endpointType}:${kolId}${search}`;
    },
  });
}

function getDefaultTtl(endpointType: string): number {
  switch (endpointType) {
    case 'profile':
      return env.CACHE_TTL_PROFILE;
    case 'pricing':
      return env.CACHE_TTL_PRICING;
    case 'audience':
      return env.CACHE_TTL_AUDIENCE;
    case 'performance':
      return env.CACHE_TTL_PERFORMANCE;
    case 'conversion':
      return env.CACHE_TTL_CONVERSION;
    case 'marketing-index':
      return env.CACHE_TTL_MARKETING_INDEX;
    default:
      return 300; // 5 minutes default
  }
}