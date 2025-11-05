import { prisma } from '@repo/db';
import { cache } from '@repo/db/redis';
import { logger } from '@config/logger';
import { config } from '@config/env';
import { crawlerService, CrawlerSearchOptions } from '@data-access/crawler';
import { 
  SearchQuery, 
  NoteSearchQuery,
  UserSearchResult, 
  NoteSearchResult,
  PaginationMeta 
} from '@types/search';
import { successResponse } from '@utils/response';
import { extractSnippet } from '@utils/response';

export class SearchService {
  private generateCacheKey(type: 'users' | 'notes', query: string, page: number, pageSize: number, sort: string, topic?: string): string {
    const topicPart = topic ? `:${topic}` : '';
    return `search:${type}:${query.toLowerCase()}:${page}:${pageSize}:${sort}${topicPart}`;
  }

  private async logSearch(query: string, resultCount: number, searchTime: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      await prisma.queryLog.create({
        data: {
          query,
          params: { resultCount, searchTime },
          duration: searchTime,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      logger.error('Failed to log search query', { error, query });
    }
  }

  async searchUsers(query: SearchQuery, ipAddress?: string, userAgent?: string) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('users', query.q, query.page, query.pageSize, query.sort);
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey) as any;
      if (cached) {
        logger.debug('Cache hit for user search', { query: query.q, page: query.page });
        return {
          ...cached,
          meta: {
            ...cached.meta,
            cached: true,
          },
        };
      }

      // Perform search via crawler
      const crawlerOptions: CrawlerSearchOptions = {
        query: query.q,
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort as 'relevance' | 'date' | 'popularity',
      };

      const crawlerResult = await crawlerService.searchUsers(crawlerOptions);
      
      // Transform crawler results to our DTO format
      const users: UserSearchResult[] = crawlerResult.results.map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followersCount,
        notesCount: user.notesCount,
        verified: user.verified,
      }));

      const total = crawlerResult.total;
      const pagination: PaginationMeta = {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
        hasNext: crawlerResult.hasMore,
        hasPrev: query.page > 1,
      };

      const searchTime = Date.now() - startTime;
      const result = successResponse(users, {
        pagination,
        query: query.q,
        searchTime,
        cached: false,
      });

      // Cache the result
      await cache.set(cacheKey, result, { ttl: config.search.cacheTTL });
      
      // Log the search
      await this.logSearch(query.q, users.length, searchTime, ipAddress, userAgent);

      logger.info('User search completed', { 
        query: query.q, 
        page: query.page, 
        resultCount: users.length,
        searchTime,
      });

      return result;
    } catch (error) {
      logger.error('User search failed', { error, query });
      throw error;
    }
  }

  async searchNotes(query: NoteSearchQuery, ipAddress?: string, userAgent?: string) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('notes', query.q, query.page, query.pageSize, query.sort, query.topic);
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey) as any;
      if (cached) {
        logger.debug('Cache hit for note search', { query: query.q, page: query.page, topic: query.topic });
        return {
          ...cached,
          meta: {
            ...cached.meta,
            cached: true,
          },
        };
      }

      // Perform search via crawler
      const crawlerOptions: CrawlerSearchOptions = {
        query: query.q,
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort as 'relevance' | 'date' | 'popularity',
        topic: query.topic,
      };

      const crawlerResult = await crawlerService.searchNotes(crawlerOptions);
      
      // Transform crawler results to our DTO format
      const notes: NoteSearchResult[] = crawlerResult.results.map(note => ({
        id: note.id,
        title: note.title,
        slug: note.slug,
        snippet: extractSnippet(note.content, query.q),
        author: {
          id: note.author.id,
          username: note.author.username,
          name: note.author.name,
          avatar: note.author.avatar,
        },
        tags: note.tags,
        stats: {
          viewCount: note.viewCount,
          likeCount: note.likeCount,
          shareCount: note.shareCount,
          commentCount: note.commentCount,
        },
        publishedAt: note.publishedAt,
        topic: note.topic,
      }));

      const total = crawlerResult.total;
      const pagination: PaginationMeta = {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
        hasNext: crawlerResult.hasMore,
        hasPrev: query.page > 1,
      };

      const searchTime = Date.now() - startTime;
      const result = successResponse(notes, {
        pagination,
        query: query.q,
        searchTime,
        cached: false,
      });

      // Cache the result
      await cache.set(cacheKey, result, { ttl: config.search.cacheTTL });
      
      // Log the search
      await this.logSearch(query.q, notes.length, searchTime, ipAddress, userAgent);

      logger.info('Note search completed', { 
        query: query.q, 
        page: query.page, 
        topic: query.topic,
        resultCount: notes.length,
        searchTime,
      });

      return result;
    } catch (error) {
      logger.error('Note search failed', { error, query });
      throw error;
    }
  }
}

export const searchService = new SearchService();