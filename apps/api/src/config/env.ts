import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // Crawler Configuration
  CRAWLER_CONCURRENT_REQUESTS: z.string().transform(Number).default('3'),
  CRAWLER_REQUEST_DELAY: z.string().transform(Number).default('2000'),
  CRAWLER_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // Authentication (for crawler)
  CRAWLER_USERNAME: z.string().optional(),
  CRAWLER_PASSWORD: z.string().optional(),
  CRAWLER_SESSION_COOKIES: z.string().optional(),
  
  // API Configuration
  API_RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'), // 1 minute
  API_RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  
  // Cache Configuration
  CACHE_TTL_PROFILE: z.string().transform(Number).default('3600'), // 1 hour
  CACHE_TTL_PRICING: z.string().transform(Number).default('1800'), // 30 minutes
  CACHE_TTL_AUDIENCE: z.string().transform(Number).default('7200'), // 2 hours
  CACHE_TTL_PERFORMANCE: z.string().transform(Number).default('1800'), // 30 minutes
  CACHE_TTL_CONVERSION: z.string().transform(Number).default('3600'), // 1 hour
  CACHE_TTL_MARKETING_INDEX: z.string().transform(Number).default('900'), // 15 minutes
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;