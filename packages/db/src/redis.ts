import Redis, { RedisOptions } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisConfig: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export const redis = new Redis(REDIS_URL, redisConfig);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

export const DEFAULT_TTL = 3600;

export const TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  VERY_LONG: 86400,
} as const;

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
}

export class CacheHelper {
  private namespace: string;

  constructor(namespace: string = 'app') {
    this.namespace = namespace;
  }

  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.buildKey(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || DEFAULT_TTL;
      const serialized = JSON.stringify(value);
      await redis.setex(this.buildKey(key), ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await redis.del(this.buildKey(key));
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.buildKey(key));
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(this.buildKey(pattern));
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(this.buildKey(key));
    } catch (error) {
      console.error(`Cache ttl error for key ${key}:`, error);
      return -2;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await redis.expire(this.buildKey(key), seconds);
      return result === 1;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number | null> {
    try {
      return await redis.incrby(this.buildKey(key), amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  async decrement(key: string, amount: number = 1): Promise<number | null> {
    try {
      return await redis.decrby(this.buildKey(key), amount);
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error);
      return null;
    }
  }

  // Pipeline support for complex operations
  pipeline() {
    return redis.pipeline();
  }
}

export const cache = new CacheHelper('app');

export const noteCache = new CacheHelper('note');
export const userCache = new CacheHelper('user');
export const commentCache = new CacheHelper('comment');
export const jobCache = new CacheHelper('job');

export async function connectRedis(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ Redis health check passed');
    return true;
  } catch (error) {
    console.error('❌ Redis health check failed:', error);
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  console.log('✅ Redis disconnected successfully');
}

export async function clearCache(namespace?: string): Promise<number> {
  try {
    const pattern = namespace ? `${namespace}:*` : '*';
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.error('Cache clear error:', error);
    return 0;
  }
}
