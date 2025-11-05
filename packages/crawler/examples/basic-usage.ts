import { CrawlerService, XiaohongshuCrawler } from '../src/index.js';

async function basicExample() {
  console.log('=== Basic Crawler Example ===\n');

  const crawler = new CrawlerService({
    enableMetrics: true,
  });

  try {
    // Example: Crawl a public page
    console.log('Crawling example.com...');
    const result = await crawler.crawl({
      url: 'https://example.com',
      timeout: 30000,
    });

    console.log('Status:', result.statusCode);
    console.log('URL:', result.url);
    console.log('Duration:', result.metadata?.duration, 'ms');
    console.log('Fingerprint:', result.metadata?.fingerprint);
    
    // Get stats
    console.log('\nScheduler Stats:', crawler.getSchedulerStats());
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await crawler.close();
  }
}

async function xiaohongshuExample() {
  console.log('\n=== Xiaohongshu Crawler Example ===\n');

  const xhsCrawler = new XiaohongshuCrawler({
    enableMetrics: true,
  });

  try {
    // Example: Fetch note detail (placeholder implementation)
    console.log('Fetching note detail...');
    
    // Note: This will fail without actual Xiaohongshu infrastructure
    // It's provided as an example of how the API would be used
    
    // const noteDetail = await xhsCrawler.fetchNoteDetail('some-note-id');
    // console.log('Note:', noteDetail.data);

    console.log('XHS Crawler initialized successfully');
    console.log('Ready to fetch note details, search notes, etc.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await xhsCrawler.close();
  }
}

async function concurrencyExample() {
  console.log('\n=== Concurrency Example ===\n');

  const crawler = new CrawlerService();

  try {
    const urls = [
      'https://example.com',
      'https://example.org',
      'https://example.net',
    ];

    console.log(`Crawling ${urls.length} URLs concurrently...`);

    const results = await Promise.all(
      urls.map((url) =>
        crawler.crawl({
          url,
          timeout: 30000,
        })
      )
    );

    console.log(`Successfully crawled ${results.length} pages`);
    console.log('Stats:', crawler.getSchedulerStats());
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await crawler.close();
  }
}

// Run examples
async function main() {
  // Uncomment to run individual examples
  // await basicExample();
  // await xiaohongshuExample();
  // await concurrencyExample();

  console.log('\n=== Examples Complete ===');
  console.log('\nTo run actual crawls:');
  console.log('1. Install Playwright browsers: pnpm install:browsers');
  console.log('2. Uncomment the example functions above');
  console.log('3. Run: node --loader ts-node/esm examples/basic-usage.ts');
}

main().catch(console.error);
