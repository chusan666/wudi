import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'silent']).default('info'),
});

export const env = envSchema.parse(process.env);

export const config = {
  port: env.PORT,
  env: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  search: {
    cacheTTL: 300, // 5 minutes
    rateLimitWindow: 60, // 1 minute
    rateLimitMax: 10, // 10 requests per minute per IP/keyword
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
  },
};