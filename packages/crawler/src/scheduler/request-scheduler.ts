import { EventEmitter } from 'events';
import { getEnv } from '../config/env.js';
import { getLogger } from '../config/logger.js';
import type { CrawlerMetrics, SchedulerStats } from '../types/index.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { CircuitBreaker } from '../utils/circuit-breaker.js';
import { retry } from '../utils/retry.js';

export interface RequestTask<T> {
  id: string;
  fn: () => Promise<T>;
  priority?: number;
  createdAt: Date;
}

export interface SchedulerOptions {
  concurrency?: number;
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
  retryMaxAttempts?: number;
  retryInitialDelayMs?: number;
  retryMaxDelayMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeoutMs?: number;
}

export class RequestScheduler extends EventEmitter {
  private queue: RequestTask<any>[] = [];
  private activeCount = 0;
  private stats = {
    queued: 0,
    active: 0,
    completed: 0,
    failed: 0,
    rateLimited: 0,
  };

  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private readonly logger = getLogger();
  private readonly options: Required<SchedulerOptions>;

  constructor(options: SchedulerOptions = {}) {
    super();
    const env = getEnv();

    this.options = {
      concurrency: options.concurrency ?? env.CRAWLER_CONCURRENCY,
      rateLimitMaxRequests: options.rateLimitMaxRequests ?? env.CRAWLER_RATE_LIMIT,
      rateLimitWindowMs: options.rateLimitWindowMs ?? env.CRAWLER_RATE_WINDOW_MS,
      retryMaxAttempts: options.retryMaxAttempts ?? env.CRAWLER_RETRY_MAX_ATTEMPTS,
      retryInitialDelayMs: options.retryInitialDelayMs ?? env.CRAWLER_RETRY_INITIAL_DELAY_MS,
      retryMaxDelayMs: options.retryMaxDelayMs ?? env.CRAWLER_RETRY_MAX_DELAY_MS,
      circuitBreakerThreshold: options.circuitBreakerThreshold ?? env.CRAWLER_CIRCUIT_BREAKER_THRESHOLD,
      circuitBreakerTimeoutMs: options.circuitBreakerTimeoutMs ?? env.CRAWLER_CIRCUIT_BREAKER_TIMEOUT_MS,
    };

    this.rateLimiter = new RateLimiter({
      maxRequests: this.options.rateLimitMaxRequests,
      windowMs: this.options.rateLimitWindowMs,
    });

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: this.options.circuitBreakerThreshold,
      resetTimeout: this.options.circuitBreakerTimeoutMs,
    });
  }

  async schedule<T>(task: RequestTask<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask: RequestTask<T> = {
        ...task,
        fn: async () => {
          try {
            const result = await this.executeTask(task);
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
      };

      this.queue.push(wrappedTask);
      this.stats.queued++;
      this.emitMetrics({ event: 'attempt', timestamp: new Date() });

      this.processQueue();
    });
  }

  private async executeTask<T>(task: RequestTask<T>): Promise<T> {
    const startTime = Date.now();

    try {
      await this.rateLimiter.acquire();
    } catch (error) {
      this.stats.rateLimited++;
      this.emitMetrics({ event: 'rate-limit', timestamp: new Date(), error: error as Error });
      throw error;
    }

    const result = await this.circuitBreaker.execute(async () => {
      return await retry(task.fn, {
        maxAttempts: this.options.retryMaxAttempts,
        initialDelayMs: this.options.retryInitialDelayMs,
        maxDelayMs: this.options.retryMaxDelayMs,
        onRetry: (attempt, error) => {
          this.emitMetrics({
            event: 'retry',
            timestamp: new Date(),
            error,
            retries: attempt,
          });
        },
      });
    });

    const duration = Date.now() - startTime;
    this.stats.completed++;
    this.emitMetrics({
      event: 'success',
      timestamp: new Date(),
      duration,
      retries: result.attempts - 1,
    });

    return result.result;
  }

  private async processQueue(): Promise<void> {
    if (this.activeCount >= this.options.concurrency || this.queue.length === 0) {
      return;
    }

    this.queue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    this.activeCount++;
    this.stats.active++;
    this.stats.queued--;

    try {
      await task.fn();
    } catch (error) {
      this.stats.failed++;
      this.emitMetrics({
        event: 'failure',
        timestamp: new Date(),
        error: error as Error,
      });
      this.logger.error({ taskId: task.id, error }, 'Task failed');
    } finally {
      this.activeCount--;
      this.stats.active--;
      this.processQueue();
    }
  }

  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  getRateLimiterStats(): { current: number; max: number; windowMs: number } {
    return this.rateLimiter.getStats();
  }

  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  private emitMetrics(metrics: CrawlerMetrics): void {
    this.emit('metrics', metrics);
  }

  clear(): void {
    this.queue = [];
    this.stats = {
      queued: 0,
      active: 0,
      completed: 0,
      failed: 0,
      rateLimited: 0,
    };
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}
