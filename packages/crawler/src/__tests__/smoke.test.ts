import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CrawlerService } from '../crawler/crawler-service.js';

describe('Smoke Test', () => {
  let crawler: CrawlerService;

  beforeAll(() => {
    crawler = new CrawlerService();
  });

  afterAll(async () => {
    await crawler.close();
  });

  it('should initialize crawler service', () => {
    expect(crawler).toBeDefined();
  });

  it('should get scheduler stats', () => {
    const stats = crawler.getSchedulerStats();
    expect(stats).toHaveProperty('queued');
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('completed');
    expect(stats).toHaveProperty('failed');
  });

  it('should get rate limiter stats', () => {
    const stats = crawler.getRateLimiterStats();
    expect(stats).toHaveProperty('current');
    expect(stats).toHaveProperty('max');
    expect(stats).toHaveProperty('windowMs');
  });

  it('should get circuit breaker state', () => {
    const state = crawler.getCircuitBreakerState();
    expect(state).toBe('CLOSED');
  });

  // Uncomment to test actual crawling (requires browser installation)
  // it('should crawl a public page', { timeout: 60000 }, async () => {
  //   const result = await crawler.crawl({
  //     url: 'https://example.com',
  //     timeout: 30000,
  //   });
  //
  //   expect(result).toHaveProperty('data');
  //   expect(result).toHaveProperty('statusCode');
  //   expect(result.statusCode).toBe(200);
  //   expect(result.url).toContain('example.com');
  // });
});
