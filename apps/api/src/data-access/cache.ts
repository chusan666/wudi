import { redis } from './redis';
import { logger } from '@/config/logger';
import { env } from '@/config/env';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Extra time to serve stale data while revalidating
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheResult<T> {
  data: T | null;
  hit: boolean;
  stale: boolean;
  tags?: string[];
}

export interface CacheJobData {
  key: string;
  fetcher: string; // Serialized function
  options: CacheOptions;
  timestamp: number;
}

export class CacheService {
  private static instance: CacheService;
  private backgroundRefreshQueue: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get data from cache with stale-while-revalidate support
   */
  async get<T>(key: string): Promise<CacheResult<T>> {
    try {
      const pipeline = redis.pipeline();
      
      // Get the main data
      pipeline.get(key);
      // Get the stale flag
      pipeline.get(`${key}:stale`);
      // Get the tags
      pipeline.smembers(`${key}:tags`);
      
      const results = await pipeline.exec();
      
      if (!results) {
        return { data: null, hit: false, stale: false };
      }

      const [dataResult, staleResult, tagsResult] = results;
      const data = dataResult[1] ? JSON.parse(dataResult[1]) : null;
      const isStale = staleResult[1] === 'true';
      const tags = tagsResult[1] as string[] || [];

      if (data === null) {
        return { data: null, hit: false, stale: false };
      }

      return {
        data,
        hit: true,
        stale: isStale,
        tags,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        message: 'Cache get error',
      });
      return { data: null, hit: false, stale: false };
    }
  }

  /**
   * Set data in cache with optional TTL and stale-while-revalidate
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const {
        ttl = env.COMMENTS_CACHE_TTL,
        staleWhileRevalidate = env.CACHE_STALE_WHILE_REVALIDATE_TTL,
        tags = [],
      } = options;

      const pipeline = redis.pipeline();
      
      // Set the main data
      if (ttl > 0) {
        pipeline.setex(key, ttl, JSON.stringify(data));
      } else {
        pipeline.set(key, JSON.stringify(data));
      }
      
      // Set stale flag after TTL expires (for stale-while-revalidate)
      if (staleWhileRevalidate > 0 && ttl > 0) {
        pipeline.setex(`${key}:stale`, ttl + staleWhileRevalidate, 'true');
      }
      
      // Set tags for invalidation
      if (tags.length > 0) {
        pipeline.sadd(`${key}:tags`, ...tags);
        pipeline.expire(`${key}:tags`, ttl + staleWhileRevalidate);
        
        // Add key to tag indexes for easy invalidation
        for (const tag of tags) {
          pipeline.sadd(`tag:${tag}`, key);
          pipeline.expire(`tag:${tag}`, ttl + staleWhileRevalidate);
        }
      }
      
      await pipeline.exec();
      
      logger.debug({
        key,
        ttl,
        staleWhileRevalidate,
        tags,
        message: 'Cache set successful',
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        message: 'Cache set error',
      });
    }
  }

  /**
   * Delete data from cache
   */
  async del(key: string): Promise<void> {
    try {
      // Get tags before deletion
      const tags = await redis.smembers(`${key}:tags`);
      
      const pipeline = redis.pipeline();
      
      // Delete main data and metadata
      pipeline.del(key);
      pipeline.del(`${key}:stale`);
      pipeline.del(`${key}:tags`);
      
      // Remove key from tag indexes
      for (const tag of tags) {
        pipeline.srem(`tag:${tag}`, key);
      }
      
      await pipeline.exec();
      
      logger.debug({
        key,
        tags,
        message: 'Cache delete successful',
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        message: 'Cache delete error',
      });
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`);
      
      if (keys.length === 0) {
        return;
      }

      const pipeline = redis.pipeline();
      
      for (const key of keys) {
        pipeline.del(key);
        pipeline.del(`${key}:stale`);
        pipeline.del(`${key}:tags`);
      }
      
      pipeline.del(`tag:${tag}`);
      
      await pipeline.exec();
      
      logger.info({
        tag,
        keyCount: keys.length,
        message: 'Cache invalidation by tag successful',
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        tag,
        message: 'Cache invalidation by tag error',
      });
    }
  }

  /**
   * Get data with automatic background refresh for stale data
   */
  async getWithRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const result = await this.get<T>(key);
    
    if (result.data !== null) {
      // If data is fresh, return it immediately
      if (!result.stale) {
        return result.data;
      }
      
      // If data is stale, schedule background refresh but return stale data
      this.scheduleBackgroundRefresh(key, fetcher, options);
      return result.data;
    }
    
    // No cache hit, fetch fresh data
    const freshData = await fetcher();
    await this.set(key, freshData, options);
    
    return freshData;
  }

  /**
   * Schedule background refresh of cache
   */
  private scheduleBackgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): void {
    // Avoid scheduling multiple refreshes for the same key
    if (this.backgroundRefreshQueue.has(key)) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        logger.debug({
          key,
          message: 'Starting background cache refresh',
        });
        
        const freshData = await fetcher();
        await this.set(key, freshData, options);
        
        logger.debug({
          key,
          message: 'Background cache refresh completed',
        });
      } catch (error) {
        logger.error({
          error: error instanceof Error ? error.message : 'Unknown error',
          key,
          message: 'Background cache refresh failed',
        });
      } finally {
        this.backgroundRefreshQueue.delete(key);
      }
    }, 100); // Small delay to avoid immediate execution

    this.backgroundRefreshQueue.set(key, timeout);
  }

  /**
   * Clear all cache (dangerous operation)
   */
  async clear(): Promise<void> {
    try {
      await redis.flushdb();
      logger.warn({
        message: 'Cache cleared completely',
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Cache clear error',
      });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connectedClients: number;
  }> {
    try {
      const info = await redis.info('memory');
      const clients = await redis.info('clients');
      const keyCount = await redis.dbsize();
      
      const memoryUsage = info.split('\r\n')
        .find(line => line.startsWith('used_memory_human:'))
        ?.split(':')[1] || 'unknown';
      
      const connectedClients = clients.split('\r\n')
        .find(line => line.startsWith('connected_clients:'))
        ?.split(':')[1] || 'unknown';
      
      return {
        totalKeys: keyCount,
        memoryUsage,
        connectedClients: parseInt(connectedClients) || 0,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Cache stats error',
      });
      return {
        totalKeys: 0,
        memoryUsage: 'unknown',
        connectedClients: 0,
      };
    }
  }
}

export const cacheService = CacheService.getInstance();