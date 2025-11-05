import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { getEnv } from '../config/env.js';
import { getLogger } from '../config/logger.js';
import type { BrowserFingerprint, ProxyConfig } from '../types/index.js';
import { generateFingerprint, generateFingerprintId, generateRandomHeaders } from '../utils/fingerprint.js';

export interface ContextManagerOptions {
  proxy?: ProxyConfig;
  persistCookies?: boolean;
}

export class ContextManager {
  private browser: Browser | null = null;
  private contexts: Map<string, { context: BrowserContext; fingerprint: BrowserFingerprint }> = new Map();
  private readonly logger = getLogger();
  private readonly env = getEnv();
  private readonly options: ContextManagerOptions;

  constructor(options: ContextManagerOptions = {}) {
    this.options = options;
  }

  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    this.logger.info('Initializing browser');

    const headlessValue = this.env.CRAWLER_HEADLESS;
    const headless: boolean | undefined = headlessValue === 'true' ? true : headlessValue === 'false' ? false : true;

    const launchOptions: Parameters<typeof chromium.launch>[0] = {
      headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    };

    this.browser = await chromium.launch(launchOptions);
    this.logger.info('Browser initialized');
  }

  async createContext(options: ContextManagerOptions = {}): Promise<{ contextId: string; context: BrowserContext }> {
    if (!this.browser) {
      await this.initialize();
    }

    const fingerprint = generateFingerprint();
    const contextId = generateFingerprintId(fingerprint);

    this.logger.info({ contextId, fingerprint }, 'Creating browser context');

    const contextOptions: Parameters<Browser['newContext']>[0] = {
      userAgent: fingerprint.userAgent,
      viewport: fingerprint.viewport,
      deviceScaleFactor: fingerprint.deviceScaleFactor,
      isMobile: fingerprint.isMobile,
      hasTouch: fingerprint.hasTouch,
      locale: fingerprint.locale,
      timezoneId: fingerprint.timezone,
      extraHTTPHeaders: generateRandomHeaders(fingerprint),
      ignoreHTTPSErrors: true,
    };

    if (options.proxy) {
      contextOptions.proxy = {
        server: options.proxy.server,
        username: options.proxy.username,
        password: options.proxy.password,
      };
    }

    const context = await this.browser!.newContext(contextOptions);

    await this.applyStealthTechniques(context);

    this.contexts.set(contextId, { context, fingerprint });

    return { contextId, context };
  }

  private async applyStealthTechniques(context: BrowserContext): Promise<void> {
    await context.addInitScript(`
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      window.navigator.chrome = {
        runtime: {},
      };

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => {
        if (parameters.name === 'notifications') {
          return Promise.resolve({ state: 'denied' });
        }
        return originalQuery(parameters);
      };
    `);
  }

  async getOrCreateContext(contextId?: string): Promise<{ contextId: string; context: BrowserContext }> {
    if (contextId && this.contexts.has(contextId)) {
      const existing = this.contexts.get(contextId)!;
      return { contextId, context: existing.context };
    }

    return this.createContext();
  }

  async closeContext(contextId: string): Promise<void> {
    const contextData = this.contexts.get(contextId);
    if (contextData) {
      await contextData.context.close();
      this.contexts.delete(contextId);
      this.logger.info({ contextId }, 'Browser context closed');
    }
  }

  async closeAll(): Promise<void> {
    this.logger.info('Closing all browser contexts');

    for (const [contextId, { context }] of this.contexts.entries()) {
      await context.close();
      this.contexts.delete(contextId);
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info('Browser closed');
    }
  }

  getActiveContexts(): string[] {
    return Array.from(this.contexts.keys());
  }
}
