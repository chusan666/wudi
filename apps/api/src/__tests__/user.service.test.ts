import { describe, it, expect, beforeAll, afterAll, mock } from 'bun:test';
import * as userService from '@/services/user.service.js';
import * as crawlerDataAccess from '@/data-access/crawler.data-access.js';
import type { CrawledUserData, CrawledUserNotesData } from '@/types/user.js';

// Mock environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb?schema=public';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3000';

describe('User Service', () => {
  beforeAll(async () => {
    // Initialize services if needed
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('getUserProfile', () => {
    it('should handle user not found in database', async () => {
      // Mock crawler to fail
      const originalCrawl = crawlerDataAccess.crawlUserProfile;
      (crawlerDataAccess as any).crawlUserProfile = mock(async () => {
        throw new Error('User not found on Xiaohongshu');
      });

      try {
        await userService.getUserProfile('nonexistent-user-id', { skipCache: true });
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.name).toBe('NotFoundError');
      } finally {
        (crawlerDataAccess as any).crawlUserProfile = originalCrawl;
      }
    });

    it('should successfully fetch and cache a user profile', async () => {
      // Mock successful crawl
      const mockCrawledData: CrawledUserData = {
        userId: 'test-user-123',
        username: 'testuser',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'This is a test user bio',
        followerCount: 1000,
        followingCount: 500,
        noteCount: 100,
        likeCount: 5000,
        collectCount: 200,
        certifications: ['Verified'],
        location: 'Test City',
        ipLocation: 'Test Location',
        gender: 'female',
      };

      const originalCrawl = crawlerDataAccess.crawlUserProfile;
      (crawlerDataAccess as any).crawlUserProfile = mock(async () => mockCrawledData);

      try {
        const result = await userService.getUserProfile('test-user-123', { skipCache: true });
        
        expect(result).toBeDefined();
        expect(result.id).toBe('test-user-123');
        expect(result.username).toBe('testuser');
        expect(result.name).toBe('Test User');
        expect(result.statistics.followerCount).toBe(1000);
        expect(result.statistics.noteCount).toBe(100);
        expect(result.certifications).toContain('Verified');
      } finally {
        (crawlerDataAccess as any).crawlUserProfile = originalCrawl;
      }
    });
  });

  describe('getUserNotes', () => {
    it('should return paginated user notes with metadata', async () => {
      // Mock user profile crawl
      const mockCrawledUser: CrawledUserData = {
        userId: 'test-user-456',
        username: 'testuser2',
        name: 'Test User 2',
        followerCount: 500,
        followingCount: 300,
        noteCount: 50,
        likeCount: 2000,
        collectCount: 100,
      };

      const originalCrawlUser = crawlerDataAccess.crawlUserProfile;
      (crawlerDataAccess as any).crawlUserProfile = mock(async () => mockCrawledUser);

      try {
        const result = await userService.getUserNotes('test-user-456', {
          page: 1,
          pageSize: 20,
          sort: 'latest',
          skipCache: true,
        });
        
        expect(result).toBeDefined();
        expect(result.notes).toBeDefined();
        expect(Array.isArray(result.notes)).toBe(true);
        expect(result.pagination).toBeDefined();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(20);
        expect(typeof result.pagination.total).toBe('number');
        expect(typeof result.pagination.totalPages).toBe('number');
        expect(typeof result.pagination.hasMore).toBe('boolean');
      } finally {
        (crawlerDataAccess as any).crawlUserProfile = originalCrawlUser;
      }
    });

    it('should respect pagination parameters', async () => {
      // Mock user profile crawl
      const mockCrawledUser: CrawledUserData = {
        userId: 'test-user-789',
        username: 'testuser3',
        name: 'Test User 3',
        followerCount: 200,
        followingCount: 100,
        noteCount: 10,
        likeCount: 500,
        collectCount: 50,
      };

      const originalCrawlUser = crawlerDataAccess.crawlUserProfile;
      (crawlerDataAccess as any).crawlUserProfile = mock(async () => mockCrawledUser);

      try {
        const result = await userService.getUserNotes('test-user-789', {
          page: 2,
          pageSize: 10,
          sort: 'popular',
          skipCache: true,
        });
        
        expect(result.pagination.page).toBe(2);
        expect(result.pagination.pageSize).toBe(10);
      } finally {
        (crawlerDataAccess as any).crawlUserProfile = originalCrawlUser;
      }
    });
  });
});
