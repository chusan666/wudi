import { getLogger } from '../config/logger.js';
import { CrawlerError } from '../types/index.js';

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<{ result: T; attempts: number }> {
  const logger = getLogger();
  const backoffMultiplier = options.backoffMultiplier ?? 2;
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return { result, attempts: attempt };
    } catch (error) {
      lastError = error as Error;

      const isRetryable =
        error instanceof CrawlerError ? error.retryable : true;

      if (!isRetryable || attempt >= options.maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        options.initialDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        options.maxDelayMs,
      );

      logger.warn(
        `Attempt ${attempt}/${options.maxAttempts} failed: ${(error as Error).message}. Retrying in ${delay}ms`,
      );

      if (options.onRetry) {
        options.onRetry(attempt, error as Error);
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateBackoff(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  multiplier: number = 2,
): number {
  return Math.min(initialDelayMs * Math.pow(multiplier, attempt - 1), maxDelayMs);
}
