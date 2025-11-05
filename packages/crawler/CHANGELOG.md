# Changelog

All notable changes to the @xiaohongshu/crawler package will be documented in this file.

## [1.0.0] - 2025-01-XX

### Added

#### Core Infrastructure
- **CrawlerService**: Main crawler orchestration service
  - Generic crawling with configurable options
  - Timeout handling and error management
  - Resource cleanup
  - Metrics emission

- **XiaohongshuCrawler**: Platform-specific implementation
  - `fetchNoteDetail()`: Fetch note details by ID
  - `searchNotes()`: Search notes by keyword
  - `fetchUserProfile()`: Fetch user profile (authenticated)
  - `fetchComments()`: Fetch note comments
  - Placeholder for signature token computation

#### Browser Management
- **ContextManager**: Browser context lifecycle management
  - Playwright Chromium integration
  - Headless mode configuration
  - Proxy support with authentication
  - Context pooling and cleanup
  - Stealth techniques:
    - Removes `navigator.webdriver` flag
    - Spoofs Chrome runtime
    - Randomizes plugins array
    - Modifies permission queries

#### Fingerprinting
- **Fingerprint Generation**: Randomized browser profiles
  - User-Agent rotation (Chrome, Firefox, Safari)
  - Dynamic viewport sizes
  - Device scale factor variation
  - Mobile vs desktop profiles
  - Locale and timezone randomization
  - Realistic HTTP headers

#### Request Scheduling
- **RequestScheduler**: Queue-based task management
  - Configurable concurrency limits
  - Priority-based scheduling
  - Event-based metrics
  - Integration with rate limiter and circuit breaker

#### Rate Limiting
- **RateLimiter**: Sliding window rate limiting
  - Configurable max requests per window
  - Window-based token bucket
  - Automatic cleanup of expired requests
  - Stats reporting

#### Resilience Patterns
- **CircuitBreaker**: Failure isolation
  - Three states: CLOSED, OPEN, HALF_OPEN
  - Configurable failure threshold
  - Auto-reset after timeout
  - Half-open trial period

- **Retry Logic**: Exponential backoff
  - Configurable max attempts
  - Initial and max delay settings
  - Backoff multiplier
  - Per-retry callbacks

#### Session Management
- **SessionManager**: Authentication and cookie persistence
  - Session creation with credentials
  - Cookie persistence across contexts
  - Session restoration
  - Expiration tracking
  - Automatic cleanup

#### Configuration
- **Environment validation**: Zod-based schema validation
  - Sensible defaults for all settings
  - Type-safe configuration
  - Cached configuration
  - Runtime validation

- **Logging**: Pino structured logging
  - Environment-aware formatting
  - Pretty output in development
  - JSON output in production
  - Silent mode in tests

#### Error Handling
- Custom error classes:
  - `CrawlerError`: Base error class
  - `RateLimitError`: Rate limit exceeded (retryable)
  - `TimeoutError`: Request timeout (retryable)
  - `CircuitBreakerError`: Circuit breaker open (retryable)

#### Testing
- **Unit Tests**:
  - Rate limiter (5 tests)
  - Circuit breaker (7 tests)
  - Fingerprint generation (5 tests)
  - Scheduler (6 tests)
  - Smoke tests (4 tests)
- Total: 27 tests, all passing

#### Documentation
- Comprehensive README with usage examples
- Architecture documentation
- API reference
- Configuration guide
- Best practices
- Safety considerations
- Example code

#### Build & Development
- TypeScript configuration
- Vitest test runner
- ESM module format
- Type declarations
- Source maps

### Configuration Options

Environment variables:
- `CRAWLER_CONCURRENCY` (default: 3)
- `CRAWLER_RATE_LIMIT` (default: 10)
- `CRAWLER_RATE_WINDOW_MS` (default: 60000)
- `CRAWLER_TIMEOUT_MS` (default: 30000)
- `CRAWLER_RETRY_MAX_ATTEMPTS` (default: 3)
- `CRAWLER_RETRY_INITIAL_DELAY_MS` (default: 1000)
- `CRAWLER_RETRY_MAX_DELAY_MS` (default: 30000)
- `CRAWLER_CIRCUIT_BREAKER_THRESHOLD` (default: 5)
- `CRAWLER_CIRCUIT_BREAKER_TIMEOUT_MS` (default: 60000)
- `CRAWLER_HEADLESS` (default: true)
- `CRAWLER_PROXY_URL` (optional)
- `CRAWLER_PROXY_USERNAME` (optional)
- `CRAWLER_PROXY_PASSWORD` (optional)
- `NODE_ENV` (default: development)

### Dependencies

Production:
- playwright ^1.48.0
- playwright-extra ^4.3.6
- puppeteer-extra-plugin-stealth ^2.11.2
- zod ^3.23.8
- pino ^9.5.0

Development:
- @types/node ^20.17.6
- typescript ^5.6.3
- vitest ^2.1.4

### Known Limitations

1. **Signature Tokens**: Xiaohongshu signature algorithm not implemented (placeholder only)
2. **Login Flow**: Generic login implementation needs platform-specific customization
3. **Session Storage**: In-memory only (consider Redis for production)
4. **Browser Pool**: Single browser instance (consider pooling for high-throughput)
5. **Data Extraction**: Generic extraction logic (override for specific platforms)

### Future Enhancements

- [ ] Implement Xiaohongshu signature algorithm (X-S, X-T tokens)
- [ ] Add Redis-backed session storage
- [ ] Implement browser instance pooling
- [ ] Add distributed crawling support
- [ ] Implement advanced canvas fingerprinting
- [ ] Add WebGL parameter spoofing
- [ ] Implement ML-based behavior mimicking
- [ ] Add Prometheus metrics export
- [ ] Create Grafana dashboards
- [ ] Add support for additional platforms
- [ ] Implement connection pooling
- [ ] Add parallel tab management

### Security Notes

- Credentials stored in-memory only
- No credential logging
- Proxy authentication supported
- HTTPS validation can be disabled (use with caution)
- Session cookies exposed via API (secure appropriately)

### Performance Notes

- Default concurrency: 3 (adjustable)
- Rate limit: 10 requests/minute (adjustable)
- Circuit breaker: Opens after 5 failures (adjustable)
- Retry: 3 attempts with exponential backoff (adjustable)
- Browser contexts created/destroyed per request (consider reuse)

### Breaking Changes

None (initial release)
