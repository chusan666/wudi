import type { Page } from 'playwright';
import { getEnv } from '../config/env.js';
import { getLogger } from '../config/logger.js';
import { ContextManager } from '../browser/context-manager.js';
import { SessionManager } from '../session/session-manager.js';
import { RequestScheduler } from '../scheduler/request-scheduler.js';
import type { CrawlOptions, CrawlResult, CrawlerMetrics, ProxyConfig } from '../types/index.js';
import { CrawlerError, TimeoutError } from '../types/index.js';

export interface CrawlerServiceOptions {
  proxy?: ProxyConfig;
  enableMetrics?: boolean;
  sessionManager?: SessionManager;
}

export class CrawlerService {
  private contextManager: ContextManager;
  private sessionManager: SessionManager;
  private scheduler: RequestScheduler;
  private readonly logger = getLogger();
  private readonly env = getEnv();
  private readonly options: CrawlerServiceOptions;

  constructor(options: CrawlerServiceOptions = {}) {
    this.options = options;
    this.contextManager = new ContextManager({ proxy: options.proxy });
    this.sessionManager = options.sessionManager ?? new SessionManager();
    this.scheduler = new RequestScheduler();

    if (options.enableMetrics) {
      this.setupMetricsLogging();
    }
  }

  private setupMetricsLogging(): void {
    this.scheduler.on('metrics', (metrics: CrawlerMetrics) => {
      this.logger.info({ metrics }, `Crawler event: ${metrics.event}`);
    });
  }

  async crawl<T = any>(options: CrawlOptions): Promise<CrawlResult<T>> {
    return this.scheduler.schedule({
      id: `crawl-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fn: () => this.executeCrawl<T>(options),
      createdAt: new Date(),
    });
  }

  private async executeCrawl<T>(options: CrawlOptions): Promise<CrawlResult<T>> {
    const startTime = Date.now();
    const { contextId, context } = await this.contextManager.createContext({
      proxy: this.options.proxy,
    });

    let page: Page | null = null;

    try {
      page = await context.newPage();

      if (options.useAuthentication) {
        // Session restoration would happen here
        this.logger.info('Authentication requested but not yet implemented');
      }

      if (options.cookies) {
        await context.addCookies(
          options.cookies.map((c) => ({
            name: c.name,
            value: c.value,
            domain: c.domain || '',
            path: c.path || '/',
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
          })),
        );
      }

      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      const timeout = options.timeout ?? this.env.CRAWLER_TIMEOUT_MS;

      const response = await page.goto(options.url, {
        timeout,
        waitUntil: 'domcontentloaded',
      });

      if (!response) {
        throw new CrawlerError('No response received', 'NO_RESPONSE', undefined, true);
      }

      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout });
      }

      // Compute signature tokens if needed (placeholder for future implementation)
      await this.computeSignatureTokens(page);

      // Extract data (generic extraction, should be overridden for specific use cases)
      const data = await this.extractData<T>(page);

      const duration = Date.now() - startTime;

      return {
        data,
        statusCode: response.status(),
        url: response.url(),
        timestamp: new Date(),
        metadata: {
          duration,
          retries: 0,
          fingerprint: contextId,
        },
      };
    } catch (error) {
      if ((error as Error).message.includes('Timeout')) {
        throw new TimeoutError(`Request timeout after ${options.timeout ?? this.env.CRAWLER_TIMEOUT_MS}ms`);
      }
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
      await this.contextManager.closeContext(contextId);
    }
  }

  protected async computeSignatureTokens(page: Page): Promise<void> {
    // TODO: Implement signature token computation
    // This is a placeholder for platform-specific signature algorithms
    // Example: X-S, X-T tokens for Xiaohongshu
    this.logger.debug('Computing signature tokens (placeholder)');

    await page.evaluate(`
      // TODO: Inject JavaScript to compute platform-specific signatures
      // This will vary based on the target platform's anti-bot measures
    `);
  }

  protected async extractData<T>(page: Page): Promise<T> {
    // Generic data extraction - should be customized for specific endpoints
    const data = await page.evaluate(`
      ({
        title: document.title,
        url: window.location.href,
        html: document.documentElement.innerHTML,
      })
    `);

    return data as T;
  }

  async close(): Promise<void> {
    await this.contextManager.closeAll();
    this.scheduler.clear();
  }

  getSchedulerStats() {
    return this.scheduler.getStats();
  }

  getRateLimiterStats() {
    return this.scheduler.getRateLimiterStats();
  }

  getCircuitBreakerState() {
    return this.scheduler.getCircuitBreakerState();
  }
}
