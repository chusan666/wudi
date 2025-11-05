# Crawler Architecture

## Overview

The crawler package implements a layered architecture with clear separation of concerns, enabling flexible, maintainable, and testable web scraping infrastructure.

## Directory Structure

```
src/
├── browser/              # Browser context management
│   └── context-manager.ts
├── config/               # Configuration and environment
│   ├── env.ts
│   └── logger.ts
├── crawler/              # High-level crawler services
│   ├── crawler-service.ts
│   └── xiaohongshu-crawler.ts
├── scheduler/            # Request scheduling and queue management
│   └── request-scheduler.ts
├── session/              # Session and authentication management
│   └── session-manager.ts
├── types/                # TypeScript types and error classes
│   └── index.ts
├── utils/                # Utility functions and helpers
│   ├── circuit-breaker.ts
│   ├── fingerprint.ts
│   ├── rate-limiter.ts
│   └── retry.ts
└── index.ts              # Public API exports
```

## Layer Breakdown

### 1. Configuration Layer (`config/`)

Manages environment variables and logging configuration.

**Components:**
- `env.ts`: Validates and caches environment configuration using Zod
- `logger.ts`: Pino logger setup with environment-specific formatting

**Key Features:**
- Schema validation with sensible defaults
- Cached configuration for performance
- Environment-aware logging (pretty in dev, JSON in prod, silent in test)

### 2. Browser Layer (`browser/`)

Manages Playwright browser instances and contexts with anti-detection capabilities.

**Components:**
- `ContextManager`: Creates and manages browser contexts with randomized fingerprints

**Key Features:**
- Browser instance pooling
- Randomized fingerprints per context
- Stealth techniques (removes webdriver flag, spoofs navigator properties)
- Proxy support
- Context lifecycle management

**Anti-Detection Techniques:**
- Removes `navigator.webdriver` flag
- Adds Chrome runtime object
- Spoofs plugins array
- Modifies permission queries
- Randomizes User-Agent, viewport, locale, timezone

### 3. Session Layer (`session/`)

Handles authentication and cookie persistence for authenticated endpoints.

**Components:**
- `SessionManager`: Manages authentication sessions and cookies

**Key Features:**
- Cookie persistence
- Session expiration tracking
- Login abstraction (platform-specific implementations needed)
- Session restoration across contexts
- Automatic cleanup of expired sessions

**Use Cases:**
- Authenticated API access
- User-specific content retrieval
- Long-running authenticated sessions

### 4. Scheduler Layer (`scheduler/`)

Implements request queueing, concurrency control, and resilience patterns.

**Components:**
- `RequestScheduler`: Queue-based task scheduler with metrics

**Key Features:**
- Concurrency limiting
- Rate limiting (sliding window)
- Circuit breaker pattern
- Exponential backoff retry
- Priority scheduling
- Event-based metrics

**Resilience Patterns:**

#### Rate Limiter
- Sliding window algorithm
- Configurable max requests per window
- Throws `RateLimitError` when exceeded

#### Circuit Breaker
- Three states: CLOSED, OPEN, HALF_OPEN
- Opens after threshold failures
- Auto-resets after timeout
- Half-open trial period

#### Retry Logic
- Exponential backoff with jitter
- Configurable max attempts and delays
- Respects error retryability flags
- Per-attempt callbacks for monitoring

### 5. Crawler Layer (`crawler/`)

High-level API for web scraping with platform-specific implementations.

**Components:**
- `CrawlerService`: Base crawler with generic extraction
- `XiaohongshuCrawler`: Platform-specific crawler (placeholder implementation)

**Key Features:**
- Orchestrates all lower layers
- Generic data extraction
- Signature token computation hooks
- Metrics emission
- Resource cleanup

**Extension Points:**
- `extractData<T>()`: Override for custom data extraction
- `computeSignatureTokens()`: Override for platform-specific signatures

### 6. Utilities Layer (`utils/`)

Reusable utility functions and helpers.

**Components:**
- `fingerprint.ts`: Browser fingerprint generation
- `circuit-breaker.ts`: Circuit breaker implementation
- `rate-limiter.ts`: Rate limiting logic
- `retry.ts`: Retry with exponential backoff

### 7. Types Layer (`types/`)

TypeScript interfaces and custom error classes.

**Error Hierarchy:**
```
CrawlerError (base)
├── RateLimitError (429, retryable)
├── TimeoutError (408, retryable)
└── CircuitBreakerError (503, retryable)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Client calls crawler.crawl(options)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 2. RequestScheduler queues task                         │
│    - Checks concurrency limit                           │
│    - Enforces rate limit                                │
│    - Applies circuit breaker                            │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 3. CrawlerService.executeCrawl()                        │
│    - Creates browser context (with fingerprint)         │
│    - Opens new page                                     │
│    - Restores session if needed                         │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 4. Page Navigation                                      │
│    - Sets headers and cookies                           │
│    - Navigates to URL                                   │
│    - Waits for selector if specified                    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 5. Data Extraction                                      │
│    - Computes signature tokens (if needed)              │
│    - Extracts data via page.evaluate()                  │
│    - Wraps in CrawlResult                               │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│ 6. Cleanup & Return                                     │
│    - Closes page                                        │
│    - Closes context                                     │
│    - Emits metrics                                      │
│    - Returns CrawlResult<T>                             │
└─────────────────────────────────────────────────────────┘
```

## Metrics & Observability

### Event Types
- `attempt`: Task queued
- `success`: Task completed successfully
- `failure`: Task failed (after all retries)
- `retry`: Individual retry attempt
- `rate-limit`: Rate limit hit
- `circuit-open`: Circuit breaker opened
- `circuit-close`: Circuit breaker closed

### Metrics Data
```typescript
interface CrawlerMetrics {
  event: string;
  url?: string;
  error?: Error;
  duration?: number;
  retries?: number;
  timestamp: Date;
}
```

### Usage
```typescript
scheduler.on('metrics', (metrics) => {
  logger.info(metrics, `Event: ${metrics.event}`);
  // Send to monitoring system
});
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CRAWLER_CONCURRENCY` | 3 | Max concurrent requests |
| `CRAWLER_RATE_LIMIT` | 10 | Max requests per window |
| `CRAWLER_RATE_WINDOW_MS` | 60000 | Rate limit window (ms) |
| `CRAWLER_TIMEOUT_MS` | 30000 | Request timeout (ms) |
| `CRAWLER_RETRY_MAX_ATTEMPTS` | 3 | Max retry attempts |
| `CRAWLER_RETRY_INITIAL_DELAY_MS` | 1000 | Initial retry delay (ms) |
| `CRAWLER_RETRY_MAX_DELAY_MS` | 30000 | Max retry delay (ms) |
| `CRAWLER_CIRCUIT_BREAKER_THRESHOLD` | 5 | Failures before opening circuit |
| `CRAWLER_CIRCUIT_BREAKER_TIMEOUT_MS` | 60000 | Circuit reset timeout (ms) |
| `CRAWLER_HEADLESS` | true | Browser headless mode |
| `CRAWLER_PROXY_URL` | - | Proxy server URL (optional) |
| `CRAWLER_PROXY_USERNAME` | - | Proxy username (optional) |
| `CRAWLER_PROXY_PASSWORD` | - | Proxy password (optional) |
| `NODE_ENV` | development | Environment mode |

## Extension Guide

### Creating a Custom Crawler

```typescript
import { CrawlerService, type CrawlerServiceOptions } from '@xiaohongshu/crawler';
import type { Page } from 'playwright';

export class MyCustomCrawler extends CrawlerService {
  constructor(options: CrawlerServiceOptions = {}) {
    super(options);
  }

  async fetchProduct(productId: string) {
    return this.crawl({
      url: `https://example.com/product/${productId}`,
      waitForSelector: '.product-details',
    });
  }

  protected override async extractData<T>(page: Page): Promise<T> {
    const data = await page.evaluate(`
      ({
        name: document.querySelector('.product-name')?.textContent,
        price: document.querySelector('.product-price')?.textContent,
        description: document.querySelector('.product-desc')?.textContent,
      })
    `);
    return data as T;
  }

  protected override async computeSignatureTokens(page: Page): Promise<void> {
    // Implement platform-specific signature logic
    await page.evaluate(`
      // Custom signature computation
    `);
  }
}
```

### Adding Custom Middleware

```typescript
import { RequestScheduler } from '@xiaohongshu/crawler';

const scheduler = new RequestScheduler();

scheduler.on('metrics', (metrics) => {
  // Custom metrics handling
  if (metrics.event === 'failure') {
    notifySlack(`Crawl failed: ${metrics.error?.message}`);
  }
});
```

## Testing Strategy

### Unit Tests
- Utils: fingerprint, rate limiter, circuit breaker
- Isolated component testing

### Integration Tests
- Scheduler with rate limiting and circuit breaking
- Session manager with mock contexts

### Smoke Tests
- Basic initialization
- Stats retrieval
- Resource cleanup

### E2E Tests (Optional)
- Real browser crawling (commented out by default)
- Requires Playwright browser installation

## Performance Considerations

### Memory Management
- Browser contexts are created and destroyed per request
- Cookies and sessions stored in-memory (consider Redis for production)
- Automatic cleanup of expired sessions

### Concurrency
- Configurable concurrency limit prevents resource exhaustion
- Rate limiting prevents server overload
- Circuit breaker provides back-pressure

### Optimization Tips
1. Increase concurrency for high-throughput scenarios
2. Adjust rate limits based on target server capacity
3. Use persistent browser contexts for related requests
4. Implement session pooling for authenticated crawling
5. Consider distributed architecture for large-scale scraping

## Security Considerations

### Credentials Storage
- Session manager stores credentials in-memory
- Consider encrypted storage for production
- Implement credential rotation

### Proxy Security
- Support for authenticated proxies
- Credential injection at runtime
- No credential logging

### Data Privacy
- Minimize data retention
- Implement data anonymization where appropriate
- Respect opt-out mechanisms

## Future Enhancements

1. **Distributed Crawling**
   - Redis-backed queue
   - Multiple worker processes
   - Centralized session management

2. **Advanced Anti-Detection**
   - ML-based behavior mimicking
   - Canvas fingerprint spoofing
   - WebGL parameter randomization

3. **Performance**
   - Connection pooling
   - Browser context reuse
   - Parallel tab management

4. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alert thresholds

5. **Platform Support**
   - Additional platform crawlers
   - Generic API client patterns
   - Signature algorithm library
