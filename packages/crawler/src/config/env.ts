import { z } from 'zod';

const envSchema = z.object({
  CRAWLER_CONCURRENCY: z.coerce.number().int().positive().default(3),
  CRAWLER_RATE_LIMIT: z.coerce.number().int().positive().default(10),
  CRAWLER_RATE_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  CRAWLER_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  CRAWLER_RETRY_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
  CRAWLER_RETRY_INITIAL_DELAY_MS: z.coerce.number().int().positive().default(1000),
  CRAWLER_RETRY_MAX_DELAY_MS: z.coerce.number().int().positive().default(30000),
  CRAWLER_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(5),
  CRAWLER_CIRCUIT_BREAKER_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  CRAWLER_HEADLESS: z.enum(['true', 'false', 'new']).default('true'),
  CRAWLER_PROXY_URL: z.string().url().optional(),
  CRAWLER_PROXY_USERNAME: z.string().optional(),
  CRAWLER_PROXY_PASSWORD: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type CrawlerEnv = z.infer<typeof envSchema>;

let cachedEnv: CrawlerEnv | null = null;

export function getEnv(): CrawlerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid crawler environment configuration:', parsed.error.format());
    throw new Error('Invalid crawler environment configuration');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function resetEnv(): void {
  cachedEnv = null;
}
