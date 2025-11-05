import Redis from 'ioredis';
import { logger } from '@/config/logger';
import { env } from '@/config/env';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Enable connection pooling
    family: 4,
    keepAlive: 30000,
    // Performance optimizations
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Event listeners for Redis connection
redis.on('connect', () => {
  logger.info({
    message: 'Redis connected',
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });
});

redis.on('error', (error) => {
  logger.error({
    error: error.message,
    message: 'Redis connection error',
  });
});

redis.on('close', () => {
  logger.warn({
    message: 'Redis connection closed',
  });
});

redis.on('reconnecting', () => {
  logger.info({
    message: 'Redis reconnecting',
  });
});

// Health check function
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Redis health check failed',
    });
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  try {
    await redis.quit();
    logger.info({
      message: 'Redis connection closed gracefully',
    });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error closing Redis connection',
    });
  }
}