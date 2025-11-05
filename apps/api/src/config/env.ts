import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Cache TTL in seconds
  COMMENTS_CACHE_TTL: z.string().transform(Number).default('300'), // 5 minutes
  // Background refresh interval in seconds
  COMMENTS_REFRESH_INTERVAL: z.string().transform(Number).default('3600'), // 1 hour
});

export const env = envSchema.parse(process.env);