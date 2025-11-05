import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Redis Configuration
  REDIS_URL: z.string().min(1).optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  
  // Cache Configuration
  COMMENTS_CACHE_TTL: z.string().transform(Number).default('300'), // 5 minutes
  COMMENTS_REFRESH_INTERVAL: z.string().transform(Number).default('3600'), // 1 hour
  CACHE_STALE_WHILE_REVALIDATE_TTL: z.string().transform(Number).default('600'), // 10 minutes
  BACKGROUND_REFRESH_QUEUE_NAME: z.string().default('cache-refresh'),
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'), // per IP
  RATE_LIMIT_CRAWLER_MAX_REQUESTS: z.string().transform(Number).default('10'), // for crawler endpoints
  
  // Circuit Breaker Configuration
  CIRCUIT_BREAKER_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
  CIRCUIT_BREAKER_ERROR_THRESHOLD: z.string().transform(Number).default('5'),
  CIRCUIT_BREAKER_RESET_TIMEOUT: z.string().transform(Number).default('60000'), // 1 minute
  
  // OpenTelemetry Configuration
  OTEL_SERVICE_NAME: z.string().default('api'),
  OTEL_SERVICE_VERSION: z.string().default('1.0.0'),
  OTEL_EXPORTER_JAEGER_ENDPOINT: z.string().optional(),
  OTEL_EXPORTER_PROMETHEUS_PORT: z.string().transform(Number).default('9464'),
  OTEL_RESOURCE_ATTRIBUTES: z.string().optional(),
  
  // Performance Configuration
  PRISMA_CONNECTION_POOL_SIZE: z.string().transform(Number).default('10'),
  PRISMA_QUERY_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
  GRACEFUL_SHUTDOWN_TIMEOUT: z.string().transform(Number).default('10000'), // 10 seconds
});

export const env = envSchema.parse(process.env);