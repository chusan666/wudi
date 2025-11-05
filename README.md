# Xiaohongshu API Project

A monorepo containing a Hono-based API backend and a Playwright-based web crawling infrastructure.

## Project Structure

```
.
├── apps/
│   └── api/                    # Hono API service (planned)
├── packages/
│   └── crawler/                # Playwright-based crawler
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Features

### Crawler Infrastructure (@xiaohongshu/crawler)

A robust, production-ready web crawling system with:

- 🎭 **Playwright Integration**: Headless browser automation with Chromium
- 🎨 **Fingerprint Rotation**: Randomized User-Agent, viewport, and device profiles
- 🔄 **Request Scheduling**: Concurrent request management with priority queuing
- ⚡ **Rate Limiting**: Configurable rate limits to respect server resources
- 🔁 **Retry Logic**: Exponential backoff with circuit breaker pattern
- 🛡️ **Anti-Detection**: Stealth techniques, header randomization, cookie management
- 🔐 **Session Management**: Authentication and cookie persistence
- 📊 **Metrics & Logging**: Structured logging with event emitters
- 🌐 **Proxy Support**: Optional proxy configuration for IP rotation

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Install Playwright browsers:

```bash
pnpm install:browsers
```

### Development

```bash
# Run tests
pnpm test

# Build all packages
pnpm build

# Start API (when implemented)
pnpm dev
```

## Crawler Usage

### Basic Example

```typescript
import { CrawlerService } from '@xiaohongshu/crawler';

const crawler = new CrawlerService({
  enableMetrics: true,
});

const result = await crawler.crawl({
  url: 'https://example.com',
  timeout: 30000,
});

console.log(result.data);
await crawler.close();
```

### Xiaohongshu-Specific

```typescript
import { XiaohongshuCrawler } from '@xiaohongshu/crawler';

const xhsCrawler = new XiaohongshuCrawler();

// Fetch note detail
const note = await xhsCrawler.fetchNoteDetail('note-id');

// Search notes
const results = await xhsCrawler.searchNotes('搜索关键词');

await xhsCrawler.close();
```

### Configuration

Configure via environment variables:

```bash
# Copy example env file
cp packages/crawler/.env.example packages/crawler/.env

# Edit configuration
nano packages/crawler/.env
```

Key configuration options:

- `CRAWLER_CONCURRENCY`: Max concurrent requests (default: 3)
- `CRAWLER_RATE_LIMIT`: Max requests per window (default: 10)
- `CRAWLER_RATE_WINDOW_MS`: Rate limit window in ms (default: 60000)
- `CRAWLER_TIMEOUT_MS`: Request timeout (default: 30000)
- `CRAWLER_HEADLESS`: Browser headless mode (default: true)

See [packages/crawler/README.md](packages/crawler/README.md) for complete documentation.

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
cd packages/crawler
pnpm test:watch
```

## Architecture

### Layered Design

The crawler follows a clean architecture with separation of concerns:

1. **Browser Layer** (`browser/`): Context management, fingerprinting, stealth
2. **Session Layer** (`session/`): Authentication, cookie persistence
3. **Scheduler Layer** (`scheduler/`): Concurrency, rate limiting, circuit breaking
4. **Crawler Layer** (`crawler/`): High-level API, data extraction

### Anti-Detection Strategy

Multiple techniques to avoid detection:

- **Fingerprint Rotation**: Randomized browser profiles per request
- **Stealth Mode**: Removes automation flags, spoofs browser features
- **Header Randomization**: Realistic browser headers with locale matching
- **Rate Limiting**: Configurable limits to mimic human behavior
- **Circuit Breaker**: Prevents cascading failures when rate-limited
- **Exponential Backoff**: Smart retry logic with increasing delays

## Best Practices

1. **Respect Rate Limits**: Configure appropriate limits for target sites
2. **Use Proxies**: Rotate IP addresses to distribute requests
3. **Monitor Metrics**: Track crawler behavior and failures
4. **Handle Sessions**: Reuse authenticated sessions when possible
5. **Cleanup Resources**: Always close crawlers when done

## Safety Considerations

⚠️ **Important Legal and Ethical Guidelines**:

1. **Legal Compliance**: Ensure you have permission to crawl target websites
2. **Terms of Service**: Review and comply with website ToS
3. **Rate Limiting**: Respect server resources with appropriate limits
4. **robots.txt**: Honor robots.txt directives where applicable
5. **Data Privacy**: Handle scraped data responsibly and securely
6. **Attribution**: Use honest User-Agent strings when appropriate

## License

ISC

## Contributing

Contributions welcome! Please:

1. Ensure tests pass: `pnpm test`
2. Follow existing code patterns
3. Update documentation as needed
4. Consider ethical implications

## Roadmap

- [ ] Apps/API service implementation
- [ ] Complete Xiaohongshu signature algorithm implementation
- [ ] Additional crawler implementations (other platforms)
- [ ] Distributed crawling support
- [ ] Advanced session management
- [ ] Database integration
- [ ] Admin dashboard for monitoring
