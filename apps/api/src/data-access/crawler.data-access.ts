import { XiaohongshuCrawler } from '@xiaohongshu/crawler';
import type { CrawlResult } from '@xiaohongshu/crawler';
import type { CrawledNoteData } from '@/types/note.js';
import type { CrawledUserData, CrawledUserNotesData } from '@/types/user.js';
import { CrawlerError } from '@/types/errors.js';
import { getLogger } from '@/config/logger.js';

let crawler: XiaohongshuCrawler | null = null;

export async function getCrawler(): Promise<XiaohongshuCrawler> {
  if (!crawler) {
    crawler = new XiaohongshuCrawler();
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

    const data = result.data as any;

    if (!data) {
      throw new CrawlerError(
        'Failed to crawl note - no data returned',
        'NO_DATA'
      );
    }

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
    throw new CrawlerError('Failed to crawl note', 'CRAWL_ERROR');
  }
}

export async function crawlUserProfile(userId: string): Promise<CrawledUserData> {
  const logger = getLogger();
  logger.info({ userId }, 'Crawling user profile');

  try {
    const crawlerInstance = await getCrawler();
    const result: CrawlResult = await crawlerInstance.fetchUserProfile(userId);

    const data = result.data as any;

    if (!data) {
      throw new CrawlerError(
        'Failed to crawl user profile - no data returned',
        'NO_DATA'
      );
    }

    // Transform crawler result to our domain model
    const crawledData: CrawledUserData = {
      userId: data.userId || userId,
      username: data.username || 'unknown',
      name: data.name,
      avatar: data.avatar,
      bio: data.bio,
      followerCount: data.stats?.followers || 0,
      followingCount: data.stats?.following || 0,
      noteCount: data.stats?.notes || 0,
      likeCount: data.stats?.likes || 0,
      collectCount: data.stats?.collects || 0,
      certifications: data.certifications || [],
      location: data.location,
      ipLocation: data.ipLocation,
      gender: data.gender,
    };

    logger.info({ userId, username: crawledData.username }, 'User profile crawled successfully');
    return crawledData;
  } catch (error) {
    logger.error({ userId, error }, 'Failed to crawl user profile');
    if (error instanceof CrawlerError) {
      throw error;
    }
    throw new CrawlerError('Failed to crawl user profile', 'CRAWL_ERROR');
  }
}

export async function crawlUserNotes(
  userId: string,
  cursor?: string,
  pageSize: number = 20
): Promise<CrawledUserNotesData> {
  const logger = getLogger();
  logger.info({ userId, cursor, pageSize }, 'Crawling user notes');

  try {
    const crawlerInstance = await getCrawler();
    
    // Call the crawler to fetch user notes with pagination
    const result: CrawlResult = await crawlerInstance.crawl({
      url: `https://www.xiaohongshu.com/user/profile/${userId}/notes?cursor=${cursor || ''}&num=${pageSize}`,
      useAuthentication: true,
      timeout: 30000,
    });

    const data = result.data as any;

    if (!data) {
      throw new CrawlerError(
        'Failed to crawl user notes - no data returned',
        'NO_DATA'
      );
    }

    // Transform crawler result to our domain model
    const crawledData: CrawledUserNotesData = {
      userId,
      notes: (data.notes || []).map((note: any) => ({
        noteId: note.noteId || note.id,
        title: note.title || 'Untitled',
        coverImage: note.coverImage || note.cover,
        likeCount: note.stats?.likes || note.likeCount || 0,
        viewCount: note.stats?.views || note.viewCount || 0,
        commentCount: note.stats?.comments || note.commentCount || 0,
        tags: note.tags || [],
        publishedAt: note.publishedAt ? new Date(note.publishedAt) : undefined,
      })),
      cursor: data.cursor || data.nextCursor,
      hasMore: data.hasMore || false,
      total: data.total,
    };

    logger.info({ userId, noteCount: crawledData.notes.length }, 'User notes crawled successfully');
    return crawledData;
  } catch (error) {
    logger.error({ userId, error }, 'Failed to crawl user notes');
    if (error instanceof CrawlerError) {
      throw error;
    }
    throw new CrawlerError('Failed to crawl user notes', 'CRAWL_ERROR');
  }
}

export async function closeCrawler(): Promise<void> {
  if (crawler) {
    await crawler.close();
    crawler = null;
    getLogger().info('Crawler closed');
  }
}
