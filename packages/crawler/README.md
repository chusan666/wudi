# @xiaohongshu/crawler

A robust Playwright-based web crawling infrastructure with anti-detection capabilities, request scheduling, and session management.

## Features

- 🎭 **Playwright Integration**: Headless Chromium browser automation
- 🎨 **Fingerprint Rotation**: Randomized User-Agent, viewport, and device profiles
- 🔄 **Request Scheduling**: Concurrent request management with priority queuing
- ⚡ **Rate Limiting**: Configurable rate limits to avoid detection
- 🔁 **Retry Logic**: Exponential backoff with circuit breaker pattern
- 🛡️ **Anti-Detection**: Stealth techniques and header randomization
- 🔐 **Session Management**: Cookie persistence and authentication handling
- 📊 **Metrics & Logging**: Event emitters and structured logging
- 🌐 **Proxy Support**: Optional proxy configuration

## Installation

```bash
pnpm install @xiaohongshu/crawler
```

Install Playwright browsers:

```bash
pnpm install:browsers
```

## Quick Start

```typescript
import { CrawlerService, XiaohongshuCrawler } from '@xiaohongshu/crawler';

// Basic crawler
const crawler = new CrawlerService({
  enableMetrics: true,
});

const result = await crawler.crawl({
  url: 'https://example.com',
  timeout: 30000,
});

console.log(result.data);

// Xiaohongshu-specific crawler
const xhsCrawler = new XiaohongshuCrawler();

const noteDetail = await xhsCrawler.fetchNoteDetail('note-id-here');
console.log(noteDetail.data);

await xhsCrawler.close();
```

## Configuration

Configuration is managed via environment variables:

```bash
# Concurrency & Rate Limiting
CRAWLER_CONCURRENCY=3                    # Max concurrent requests
CRAWLER_RATE_LIMIT=10                    # Max requests per window
CRAWLER_RATE_WINDOW_MS=60000             # Rate limit window in milliseconds

# Timeouts & Retries
CRAWLER_TIMEOUT_MS=30000                 # Request timeout
CRAWLER_RETRY_MAX_ATTEMPTS=3             # Max retry attempts
CRAWLER_RETRY_INITIAL_DELAY_MS=1000      # Initial retry delay
CRAWLER_RETRY_MAX_DELAY_MS=30000         # Max retry delay

# Circuit Breaker
CRAWLER_CIRCUIT_BREAKER_THRESHOLD=5      # Failures before opening circuit
CRAWLER_CIRCUIT_BREAKER_TIMEOUT_MS=60000 # Circuit reset timeout

# Browser
CRAWLER_HEADLESS=true                    # Headless mode: true|false|new

# Proxy (optional)
CRAWLER_PROXY_URL=http://proxy:8080
CRAWLER_PROXY_USERNAME=username
CRAWLER_PROXY_PASSWORD=password

# Environment
NODE_ENV=development                     # development|production|test
```

## Core Components

### CrawlerService

Main crawler service that orchestrates browser contexts, sessions, and scheduling.

```typescript
import { CrawlerService } from '@xiaohongshu/crawler';

const crawler = new CrawlerService({
  proxy: {
    server: 'http://proxy:8080',
    username: 'user',
    password: 'pass',
  },
  enableMetrics: true,
});

const result = await crawler.crawl({
  url: 'https://example.com',
  timeout: 30000,
  waitForSelector: '.content',
  headers: {
    'Custom-Header': 'value',
  },
  cookies: [
    { name: 'session', value: 'abc123' },
  ],
});
```

### Request Scheduler

Manages concurrent requests with rate limiting and circuit breaking.

```typescript
import { RequestScheduler } from '@xiaohongshu/crawler';

const scheduler = new RequestScheduler({
  concurrency: 5,
  rateLimitMaxRequests: 20,
  rateLimitWindowMs: 60000,
});

// Listen to metrics
scheduler.on('metrics', (metrics) => {
  console.log(`Event: ${metrics.event}, Duration: ${metrics.duration}ms`);
});

// Schedule tasks
const result = await scheduler.schedule({
  id: 'unique-task-id',
  fn: async () => {
    // Your crawling logic
    return data;
  },
  priority: 1,
  createdAt: new Date(),
});

// Get stats
console.log(scheduler.getStats());
```

### Session Manager

Handles authentication and session persistence.

```typescript
import { SessionManager } from '@xiaohongshu/crawler';

const sessionManager = new SessionManager({
  sessionTTL: 24 * 60 * 60 * 1000, // 24 hours
});

// Create session with credentials
await sessionManager.createSession('session-id', context, {
  username: 'user@example.com',
  password: 'password',
});

// Restore session
const restored = await sessionManager.restoreSession('session-id', context);

// Cleanup expired sessions
sessionManager.cleanupExpiredSessions();
```

### Browser Context Manager

Manages Playwright browser contexts with fingerprint rotation.

```typescript
import { ContextManager } from '@xiaohongshu/crawler';

const contextManager = new ContextManager({
  proxy: {
    server: 'http://proxy:8080',
  },
});

await contextManager.initialize();

const { contextId, context } = await contextManager.createContext();

// Use context for crawling
const page = await context.newPage();
await page.goto('https://example.com');

await contextManager.closeContext(contextId);
await contextManager.closeAll();
```

## Anti-Detection Strategies

The crawler implements multiple anti-detection techniques:

### 1. Fingerprint Rotation

Each browser context uses a unique fingerprint:

- Randomized User-Agent strings
- Dynamic viewport sizes
- Variable device scale factors
- Random locales and timezones

```typescript
import { generateFingerprint } from '@xiaohongshu/crawler';

const fingerprint = generateFingerprint();
console.log(fingerprint);
// {
//   userAgent: "Mozilla/5.0 ...",
//   viewport: { width: 1920, height: 1080 },
//   deviceScaleFactor: 1,
//   isMobile: false,
//   hasTouch: false,
//   locale: "en-US",
//   timezone: "America/New_York"
// }
```

### 2. Stealth Techniques

Automatically applied to all contexts:

- Removes `navigator.webdriver` flag
- Adds Chrome runtime object
- Spoofs plugin array
- Modifies permission queries

### 3. Header Randomization

Generates realistic browser headers:

- Accept headers
- Accept-Language with locale matching
- DNT (Do Not Track) randomization
- Security headers (Sec-Fetch-*)

### 4. Request Scheduling

Prevents detection through traffic patterns:

- Rate limiting per time window
- Exponential backoff on failures
- Circuit breaker for temporary bans
- Request prioritization

## Signature Tokens

For platforms requiring request signing (e.g., Xiaohongshu's X-S and X-T tokens):

```typescript
// TODO: Implement platform-specific signature algorithm
// The crawler provides hooks for signature computation

class CustomCrawler extends CrawlerService {
  protected async computeSignatureTokens(page: Page): Promise<void> {
    // Extract request parameters
    const params = await page.evaluate(() => {
      // Get parameters from page
      return { /* ... */ };
    });

    // Compute signature using platform's algorithm
    const signature = await this.computeSignature(params);

    // Set headers
    await page.setExtraHTTPHeaders({
      'X-S': signature.xs,
      'X-T': signature.xt,
    });
  }

  private async computeSignature(params: any): Promise<any> {
    // TODO: Implement reverse-engineered signature algorithm
    // This varies by platform and may require:
    // - Parameter hashing
    // - Timestamp generation
    // - Token encryption
    // - Device fingerprinting
    return { xs: '', xt: '' };
  }
}
```

## Error Handling

The crawler provides specialized error types:

```typescript
import {
  CrawlerError,
  RateLimitError,
  TimeoutError,
  CircuitBreakerError,
} from '@xiaohongshu/crawler';

try {
  await crawler.crawl({ url: 'https://example.com' });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    console.log('Rate limited, waiting...');
  } else if (error instanceof TimeoutError) {
    // Handle timeout
    console.log('Request timed out');
  } else if (error instanceof CircuitBreakerError) {
    // Circuit is open, wait for reset
    console.log('Circuit breaker open');
  } else if (error instanceof CrawlerError) {
    // Generic crawler error
    console.log(`Error: ${error.code}`);
  }
}
```

## Testing

Run the test suite:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

## Best Practices

### 1. Respect Rate Limits

Configure appropriate rate limits to avoid detection:

```bash
CRAWLER_RATE_LIMIT=10          # Conservative limit
CRAWLER_RATE_WINDOW_MS=60000   # Per minute
```

### 2. Use Proxies

Rotate IP addresses to distribute requests:

```typescript
const crawler = new CrawlerService({
  proxy: {
    server: 'http://proxy-pool:8080',
  },
});
```

### 3. Monitor Metrics

Track crawler behavior:

```typescript
scheduler.on('metrics', (metrics) => {
  if (metrics.event === 'failure') {
    console.error('Crawl failed:', metrics.error);
  }
  if (metrics.event === 'rate-limit') {
    console.warn('Rate limit hit');
  }
});
```

### 4. Handle Sessions

For authenticated endpoints:

```typescript
const sessionManager = new SessionManager();

// Login once
await sessionManager.createSession('user-session', context, {
  username: 'user',
  password: 'pass',
});

// Reuse session
await sessionManager.restoreSession('user-session', newContext);
```

### 5. Cleanup Resources

Always close crawlers when done:

```typescript
try {
  await crawler.crawl({ url: 'https://example.com' });
} finally {
  await crawler.close();
}
```

## Advanced Usage

### Custom Data Extraction

Extend the crawler for specific use cases:

```typescript
class MyCustomCrawler extends CrawlerService {
  async extractProductData(url: string) {
    return this.crawl({
      url,
      waitForSelector: '.product-details',
    });
  }

  protected async extractData<T>(page: Page): Promise<T> {
    const data = await page.evaluate(() => {
      return {
        title: document.querySelector('.product-title')?.textContent,
        price: document.querySelector('.product-price')?.textContent,
        description: document.querySelector('.product-description')?.textContent,
      };
    });

    return data as T;
  }
}
```

### Priority Scheduling

Schedule high-priority tasks:

```typescript
await scheduler.schedule({
  id: 'high-priority',
  fn: async () => fetchImportantData(),
  priority: 10, // Higher priority
  createdAt: new Date(),
});

await scheduler.schedule({
  id: 'low-priority',
  fn: async () => fetchLessImportantData(),
  priority: 1,
  createdAt: new Date(),
});
```

## Safety Considerations

1. **Legal Compliance**: Ensure you have permission to crawl target websites
2. **Terms of Service**: Review and comply with website ToS
3. **Rate Limiting**: Respect server resources with appropriate limits
4. **User-Agent**: Use honest User-Agent strings that identify your bot
5. **robots.txt**: Respect robots.txt directives
6. **Data Privacy**: Handle scraped data responsibly and securely

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CrawlerService                          │
│  - Orchestrates browser contexts, sessions, and scheduling  │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────▼─────────┐ ┌──▼──────────┐ ┌──▼───────────────┐
│ ContextManager    │ │ SessionMgr  │ │ RequestScheduler │
│ - Browser pools   │ │ - Auth      │ │ - Concurrency    │
│ - Fingerprints    │ │ - Cookies   │ │ - Rate limiting  │
│ - Stealth         │ │ - Storage   │ │ - Circuit break  │
└───────────────────┘ └─────────────┘ └──────────────────┘
          │
┌─────────▼─────────────────────────────────────────────────┐
│                    Playwright Browser                      │
│  - Chromium instances with randomized configurations       │
└───────────────────────────────────────────────────────────┘
```

## License

ISC

## Contributing

Contributions welcome! Please ensure:

1. Tests pass: `pnpm test`
2. Code follows existing patterns
3. Anti-detection techniques are ethical and legal
