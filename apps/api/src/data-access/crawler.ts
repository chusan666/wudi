import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { logger } from '@config/logger';
import { env } from '@config/env';
import { CrawlerError } from '@utils/errors';

export interface CrawlerCredentials {
  username?: string;
  password?: string;
  cookies?: string;
}

export interface CrawlerOptions {
  timeout?: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
  headless?: boolean;
}

export class CrawlerManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private credentials: CrawlerCredentials;

  constructor() {
    this.credentials = {
      username: env.CRAWLER_USERNAME,
      password: env.CRAWLER_PASSWORD,
      cookies: env.CRAWLER_SESSION_COOKIES,
    };
  }

  async initialize(options: CrawlerOptions = {}): Promise<void> {
    try {
      const launchOptions = {
        headless: options.headless ?? true,
        timeout: options.timeout ?? env.CRAWLER_TIMEOUT,
      };

      this.browser = await chromium.launch(launchOptions);
      this.context = await this.browser.newContext({
        userAgent: options.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: options.viewport ?? { width: 1920, height: 1080 },
      });

      // Apply session cookies if available
      if (this.credentials.cookies) {
        try {
          const cookies = JSON.parse(this.credentials.cookies);
          await this.context.addCookies(cookies);
          logger.info('Applied session cookies to crawler context');
        } catch (error) {
          logger.warn('Failed to parse session cookies:', error);
        }
      }

      logger.info('Crawler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize crawler:', error);
      throw new CrawlerError('Failed to initialize crawler', { originalError: error });
    }
  }

  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new CrawlerError('Crawler context not initialized');
    }

    try {
      const page = await this.context.newPage();
      
      // Set default timeouts
      page.setDefaultTimeout(env.CRAWLER_TIMEOUT);
      page.setDefaultNavigationTimeout(env.CRAWLER_TIMEOUT);

      // Handle requests
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
          // Block unnecessary resources for faster crawling
          request.abort();
        } else {
          request.continue();
        }
      });

      return page;
    } catch (error) {
      logger.error('Failed to create new page:', error);
      throw new CrawlerError('Failed to create new page', { originalError: error });
    }
  }

  async authenticate(page: Page, loginUrl: string, usernameSelector: string, passwordSelector: string, submitSelector: string): Promise<void> {
    if (!this.credentials.username || !this.credentials.password) {
      throw new CrawlerError('Authentication credentials not provided');
    }

    try {
      await page.goto(loginUrl, { waitUntil: 'networkidle' });
      
      // Wait for login form
      await page.waitForSelector(usernameSelector, { timeout: 10000 });
      await page.waitForSelector(passwordSelector, { timeout: 10000 });

      // Fill credentials
      await page.fill(usernameSelector, this.credentials.username);
      await page.fill(passwordSelector, this.credentials.password);

      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click(submitSelector),
      ]);

      // Check if authentication was successful
      const currentUrl = page.url();
      if (currentUrl.includes('login') || currentUrl.includes('auth')) {
        throw new CrawlerError('Authentication failed - still on login page');
      }

      logger.info('Authentication successful');
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw new CrawlerError('Authentication failed', { originalError: error });
    }
  }

  async extractData<T>(page: Page, extractor: (page: Page) => Promise<T>): Promise<T> {
    try {
      return await extractor(page);
    } catch (error) {
      logger.error('Data extraction failed:', error);
      throw new CrawlerError('Data extraction failed', { originalError: error });
    }
  }

  async delay(ms: number = env.CRAWLER_REQUEST_DELAY): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('Crawler closed successfully');
    } catch (error) {
      logger.error('Error closing crawler:', error);
    }
  }

  isInitialized(): boolean {
    return this.browser !== null && this.context !== null;
  }
}

// Singleton instance
export const crawlerManager = new CrawlerManager();

// Platform-specific crawlers
export abstract class PlatformCrawler {
  protected manager: CrawlerManager;
  protected platform: string;

  constructor(platform: string) {
    this.platform = platform;
    this.manager = crawlerManager;
  }

  abstract extractKolProfile(platformUserId: string): Promise<any>;
  abstract extractKolPricing(platformUserId: string): Promise<any>;
  abstract extractKolAudience(platformUserId: string): Promise<any>;
  abstract extractKolPerformance(platformUserId: string): Promise<any>;
  abstract extractKolConversion(platformUserId: string): Promise<any>;
  abstract extractKolMarketingIndex(platformUserId: string): Promise<any>;

  protected async withPage<T>(operation: (page: Page) => Promise<T>): Promise<T> {
    if (!this.manager.isInitialized()) {
      await this.manager.initialize();
    }

    const page = await this.manager.newPage();
    try {
      return await operation(page);
    } finally {
      await page.close();
    }
  }
}

export class XiaohongshuCrawler extends PlatformCrawler {
  constructor() {
    super('xiaohongshu');
  }

  async extractKolProfile(platformUserId: string): Promise<any> {
    return this.withPage(async (page) => {
      // Implementation for Xiaohongshu profile extraction
      const url = `https://www.xiaohongshu.com/user/profile/${platformUserId}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Extract profile data
      const profileData = await page.evaluate(() => {
        // Placeholder extraction logic
        return {
          username: document.querySelector('.username')?.textContent,
          displayName: document.querySelector('.display-name')?.textContent,
          bio: document.querySelector('.bio')?.textContent,
          followerCount: parseInt(document.querySelector('.followers')?.textContent?.replace(/,/g, '') || '0'),
          followingCount: parseInt(document.querySelector('.following')?.textContent?.replace(/,/g, '') || '0'),
          postCount: parseInt(document.querySelector('.posts')?.textContent?.replace(/,/g, '') || '0'),
        };
      });

      return profileData;
    });
  }

  async extractKolPricing(platformUserId: string): Promise<any> {
    // Implementation for pricing extraction
    throw new CrawlerError('Pricing extraction not implemented for Xiaohongshu');
  }

  async extractKolAudience(platformUserId: string): Promise<any> {
    // Implementation for audience data extraction
    throw new CrawlerError('Audience extraction not implemented for Xiaohongshu');
  }

  async extractKolPerformance(platformUserId: string): Promise<any> {
    // Implementation for performance data extraction
    throw new CrawlerError('Performance extraction not implemented for Xiaohongshu');
  }

  async extractKolConversion(platformUserId: string): Promise<any> {
    // Implementation for conversion data extraction
    throw new CrawlerError('Conversion extraction not implemented for Xiaohongshu');
  }

  async extractKolMarketingIndex(platformUserId: string): Promise<any> {
    // Implementation for marketing index extraction
    throw new CrawlerError('Marketing index extraction not implemented for Xiaohongshu');
  }
}