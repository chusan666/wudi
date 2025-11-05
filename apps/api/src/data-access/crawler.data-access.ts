import { XiaohongshuCrawler } from '@xiaohongshu/crawler';
import type { CrawlResult } from '@xiaohongshu/crawler';
import type { CrawledNoteData } from '@/types/note.js';
import { CrawlerError } from '@/types/errors.js';
import { getLogger } from '@/config/logger.js';

let crawler: XiaohongshuCrawler | null = null;

export async function getCrawler(): Promise<XiaohongshuCrawler> {
  if (!crawler) {
    crawler = new XiaohongshuCrawler({
      headless: true,
      maxConcurrent: 2,
    });
    await crawler.initialize();
    getLogger().info('Crawler initialized');
  }
  return crawler;
}

export async function crawlNote(noteId: string): Promise<CrawledNoteData> {
  const logger = getLogger();
  logger.info({ noteId }, 'Crawling note');

  try {
    const crawlerInstance = await getCrawler();
    const result: CrawlResult = await crawlerInstance.crawlNote(noteId);

    if (!result.success || !result.data) {
      throw new CrawlerError(
        result.error || 'Failed to crawl note',
        result.error
      );
    }

    const data = result.data;

    // Transform crawler result to our domain model
    const crawledData: CrawledNoteData = {
      noteId: data.noteId || noteId,
      title: data.title || 'Untitled',
      content: data.content || '',
      authorId: data.author?.id || `user_${noteId}`,
      authorUsername: data.author?.username || 'unknown',
      authorName: data.author?.name,
      authorAvatar: data.author?.avatar,
      viewCount: data.stats?.views || 0,
      likeCount: data.stats?.likes || 0,
      shareCount: data.stats?.shares || 0,
      commentCount: data.stats?.comments || 0,
      mediaUrls: (data.media || []).map((m: any, index: number) => ({
        url: m.url || '',
        type: m.type || 'image',
        width: m.width,
        height: m.height,
      })),
      tags: data.tags || [],
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    };

    logger.info({ noteId, title: crawledData.title }, 'Note crawled successfully');
    return crawledData;
  } catch (error) {
    logger.error({ noteId, error }, 'Failed to crawl note');
    if (error instanceof CrawlerError) {
      throw error;
    }
    throw new CrawlerError('Failed to crawl note', error);
  }
}

export async function closeCrawler(): Promise<void> {
  if (crawler) {
    await crawler.close();
    crawler = null;
    getLogger().info('Crawler closed');
  }
}
