export interface CrawlOptions {
  url: string;
  timeout?: number;
  waitForSelector?: string;
  useAuthentication?: boolean;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string; path?: string }>;
}

export interface CrawlResult<T = unknown> {
  data: T;
  statusCode: number;
  url: string;
  timestamp: Date;
  metadata?: {
    duration: number;
    retries: number;
    fingerprint: string;
  };
}

export interface BrowserFingerprint {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  locale: string;
  timezone: string;
}

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}

export interface SessionCredentials {
  username: string;
  password: string;
  additionalData?: Record<string, string>;
}

export interface SessionState {
  cookies: Array<{ name: string; value: string; domain?: string; path?: string; expires?: number }>;
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  expiresAt: Date;
}

export interface SchedulerStats {
  queued: number;
  active: number;
  completed: number;
  failed: number;
  rateLimited: number;
}

export interface CrawlerMetrics {
  event: 'attempt' | 'success' | 'failure' | 'retry' | 'rate-limit' | 'circuit-open' | 'circuit-close';
  url?: string;
  error?: Error;
  duration?: number;
  retries?: number;
  timestamp: Date;
}

export class CrawlerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'CrawlerError';
  }
}

export class RateLimitError extends CrawlerError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429, true);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends CrawlerError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT', 408, true);
    this.name = 'TimeoutError';
  }
}

export class CircuitBreakerError extends CrawlerError {
  constructor(message: string = 'Circuit breaker is open') {
    super(message, 'CIRCUIT_BREAKER_OPEN', 503, true);
    this.name = 'CircuitBreakerError';
  }
}
