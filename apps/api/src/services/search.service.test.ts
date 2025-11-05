import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchService } from '@services/search.service';
import { SearchQuery, NoteSearchQuery } from '@types/search';

// Mock dependencies
vi.mock('@repo/db', () => ({
  prisma: {
    queryLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@repo/db/redis', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@data-access/crawler', () => ({
  crawlerService: {
    searchUsers: vi.fn(),
    searchNotes: vi.fn(),
  },
}));

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('should return cached results when available', async () => {
      const query: SearchQuery = { q: 'test', page: 1, pageSize: 20, sort: 'relevance' };
      const cachedResult = {
        success: true,
        data: [{ id: '1', username: 'testuser' }],
        meta: { pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
      };

      const { cache } = await import('@repo/db/redis');
      vi.mocked(cache.get).mockResolvedValue(cachedResult);

      const result = await searchService.searchUsers(query);

      expect(cache.get).toHaveBeenCalledWith('search:users:test:1:20:relevance');
      expect(result).toEqual({
        ...cachedResult,
        meta: {
          ...cachedResult.meta,
          cached: true,
        },
      });
    });

    it('should fetch new results when cache miss', async () => {
      const query: SearchQuery = { q: 'test', page: 1, pageSize: 20, sort: 'relevance' };
      
      const { cache } = await import('@repo/db/redis');
      const { crawlerService } = await import('@data-access/crawler');
      
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(crawlerService.searchUsers).mockResolvedValue({
        results: [{
          id: '1',
          username: 'testuser',
          name: 'Test User',
          avatar: null,
          bio: null,
          followersCount: 100,
          notesCount: 10,
          verified: false,
        }],
        total: 1,
        hasMore: false,
        searchTime: 50,
      });

      const result = await searchService.searchUsers(query) as any;

      expect(crawlerService.searchUsers).toHaveBeenCalledWith({
        query: 'test',
        page: 1,
        pageSize: 20,
        sort: 'relevance',
      });
      
      expect(cache.set).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        id: '1',
        username: 'testuser',
        name: 'Test User',
      });
    });
  });

  describe('searchNotes', () => {
    it('should return cached results when available', async () => {
      const query: NoteSearchQuery = { q: 'test', page: 1, pageSize: 20, sort: 'relevance', topic: 'tech' };
      const cachedResult = {
        success: true,
        data: [{ id: '1', title: 'Test Note' }],
        meta: { pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
      };

      const { cache } = await import('@repo/db/redis');
      vi.mocked(cache.get).mockResolvedValue(cachedResult);

      const result = await searchService.searchNotes(query);

      expect(cache.get).toHaveBeenCalledWith('search:notes:test:1:20:relevance:tech');
      expect(result).toEqual({
        ...cachedResult,
        meta: {
          ...cachedResult.meta,
          cached: true,
        },
      });
    });

    it('should extract snippets from note content', async () => {
      const query: NoteSearchQuery = { q: 'keyword', page: 1, pageSize: 20, sort: 'relevance' };
      
      const { cache } = await import('@repo/db/redis');
      const { crawlerService } = await import('@data-access/crawler');
      
      vi.mocked(cache.get).mockResolvedValue(null);
      vi.mocked(crawlerService.searchNotes).mockResolvedValue({
        results: [{
          id: '1',
          title: 'Test Note',
          content: 'This is a test content with keyword inside and more text around it',
          slug: 'test-note',
          authorId: 'author1',
          author: {
            id: 'author1',
            username: 'author1',
            name: 'Author 1',
            avatar: null,
          },
          tags: ['test'],
          publishedAt: new Date(),
          viewCount: 100,
          likeCount: 10,
          shareCount: 5,
          commentCount: 2,
        }],
        total: 1,
        hasMore: false,
        searchTime: 50,
      });

      const result = await searchService.searchNotes(query) as any;

      expect(result.success).toBe(true);
      expect(result.data[0].snippet).toContain('keyword');
      expect(result.data[0].snippet).toContain('...');
    });
  });
});