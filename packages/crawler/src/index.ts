// Core crawler service
export { CrawlerService, type CrawlerServiceOptions } from './crawler/crawler-service.js';
export { XiaohongshuCrawler } from './crawler/xiaohongshu-crawler.js';

// Browser management
export { ContextManager, type ContextManagerOptions } from './browser/context-manager.js';

// Session management
export { SessionManager, type SessionManagerOptions } from './session/session-manager.js';

// Scheduler
export { RequestScheduler, type SchedulerOptions, type RequestTask } from './scheduler/request-scheduler.js';

// Configuration
export { getEnv, resetEnv, type CrawlerEnv } from './config/env.js';
export { getLogger, resetLogger } from './config/logger.js';

// Types
export type {
  CrawlOptions,
  CrawlResult,
  BrowserFingerprint,
  ProxyConfig,
  SessionCredentials,
  SessionState,
  SchedulerStats,
  CrawlerMetrics,
} from './types/index.js';

export {
  CrawlerError,
  RateLimitError,
  TimeoutError,
  CircuitBreakerError,
} from './types/index.js';

// Utilities
export { generateFingerprint, generateFingerprintId, generateRandomHeaders } from './utils/fingerprint.js';
export { CircuitBreaker, CircuitState, type CircuitBreakerOptions } from './utils/circuit-breaker.js';
export { RateLimiter, type RateLimiterOptions } from './utils/rate-limiter.js';
export { retry, calculateBackoff, type RetryOptions } from './utils/retry.js';
