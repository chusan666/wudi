import { RateLimitError } from '../types/index.js';

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requestTimestamps: number[] = [];

  constructor(private readonly options: RateLimiterOptions) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > windowStart);

    if (this.requestTimestamps.length >= this.options.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + this.options.windowMs - now;

      if (waitTime > 0) {
        throw new RateLimitError(`Rate limit exceeded. Retry after ${Math.ceil(waitTime / 1000)}s`);
      }
    }

    this.requestTimestamps.push(now);
  }

  getStats(): { current: number; max: number; windowMs: number } {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    const current = this.requestTimestamps.filter((ts) => ts > windowStart).length;

    return {
      current,
      max: this.options.maxRequests,
      windowMs: this.options.windowMs,
    };
  }

  reset(): void {
    this.requestTimestamps = [];
  }
}
