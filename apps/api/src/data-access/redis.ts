import { Redis } from 'redis';
import { logger } from '@config/logger';
import { env } from '@config/env';
import { CacheError } from '@utils/errors';

class RedisClient {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis({
      url: env.REDIS_URL,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.warn('Redis client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw new CacheError('Failed to connect to cache', { originalError: error });
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  // Cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, cache get skipped for key:', key);
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get failed for key:', key, error);
      throw new CacheError('Failed to get from cache', { key, originalError: error });
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, cache set skipped for key:', key);
        return;
      }

      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set failed for key:', key, error);
      throw new CacheError('Failed to set cache', { key, originalError: error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, cache delete skipped for key:', key);
        return;
      }

      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete failed for key:', key, error);
      throw new CacheError('Failed to delete cache', { key, originalError: error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check failed for key:', key, error);
      return false;
    }
  }

  // Pattern-based operations
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, cache invalidation skipped for pattern:', pattern);
        return;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache invalidation failed for pattern:', pattern, error);
      throw new CacheError('Failed to invalidate cache pattern', { pattern, originalError: error });
    }
  }

  async getTtl(key: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return -1;
      }

      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Cache TTL check failed for key:', key, error);
      return -1;
    }
  }
}

export const redisClient = new RedisClient();

// Cache key generators
export const cacheKeys = {
  kolProfile: (id: string) => `kol:profile:${id}`,
  kolPricing: (id: string) => `kol:pricing:${id}`,
  kolAudience: (id: string) => `kol:audience:${id}`,
  kolPerformance: (id: string, contentType?: string, period?: string) => 
    `kol:performance:${id}${contentType ? `:${contentType}` : ''}${period ? `:${period}` : ''}`,
  kolConversion: (id: string, campaignId?: string) => 
    `kol:conversion:${id}${campaignId ? `:${campaignId}` : ''}`,
  kolMarketingIndex: (id: string, indexType?: string) => 
    `kol:marketing-index:${id}${indexType ? `:${indexType}` : ''}`,
  
  // Pattern for invalidating all KOL-related cache
  kolAll: (id: string) => `kol:*:${id}`,
};