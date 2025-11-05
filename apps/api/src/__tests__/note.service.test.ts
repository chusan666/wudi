import { describe, it, expect, beforeAll, afterAll, mock } from 'bun:test';
import * as noteService from '@/services/note.service.js';
import * as crawlerDataAccess from '@/data-access/crawler.data-access.js';
import type { CrawledNoteData } from '@/types/note.js';

// Mock environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3000';

describe('Note Service', () => {
  beforeAll(async () => {
    // Initialize services if needed
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('getNote', () => {
    it('should handle note not found in database', async () => {
      // Mock crawler to fail
      const originalCrawl = crawlerDataAccess.crawlNote;
      (crawlerDataAccess as any).crawlNote = mock(async () => {
        throw new Error('Note not found on Xiaohongshu');
      });

      try {
        await noteService.getNote('nonexistent-note-id', { skipCache: true });
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('NotFoundError');
      } finally {
        (crawlerDataAccess as any).crawlNote = originalCrawl;
      }
    });

    it('should successfully fetch and cache a note', async () => {
      // Mock successful crawl
      const mockCrawledData: CrawledNoteData = {
        noteId: 'test-note-123',
        title: 'Test Note',
        content: 'This is test content',
        authorId: 'test-author-123',
        authorUsername: 'testuser',
        authorName: 'Test User',
        viewCount: 1000,
        likeCount: 50,
        shareCount: 10,
        commentCount: 5,
        mediaUrls: [
          { url: 'https://example.com/image.jpg', type: 'image', width: 1920, height: 1080 }
        ],
        tags: ['test', 'mock'],
        publishedAt: new Date('2024-01-01'),
      };

      const originalCrawl = crawlerDataAccess.crawlNote;
      (crawlerDataAccess as any).crawlNote = mock(async () => mockCrawledData);

      try {
        const result = await noteService.getNote('test-note-123', { skipCache: true });
        
        expect(result).toBeDefined();
        expect(result.id).toBe('test-note-123');
        expect(result.title).toBe('Test Note');
        expect(result.author.username).toBe('testuser');
        expect(result.statistics.likeCount).toBe(50);
        expect(result.media).toHaveLength(1);
        expect(result.tags).toContain('test');
      } finally {
        (crawlerDataAccess as any).crawlNote = originalCrawl;
      }
    });
  });
});
