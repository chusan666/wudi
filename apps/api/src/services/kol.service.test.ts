import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KolService } from '@services/kol.service';
import { prisma } from '@data-access/prisma';
import { redisClient } from '@data-access/redis';
import { crawlerManager } from '@data-access/crawler';
import { NotFoundError, CrawlerError } from '@utils/errors';

// Mock dependencies
vi.mock('@data-access/prisma');
vi.mock('@data-access/redis');
vi.mock('@data-access/crawler');
vi.mock('@config/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('KolService', () => {
  let kolService: KolService;

  beforeEach(() => {
    kolService = new KolService();
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return cached profile data when available', async () => {
      const kolId = 'kol-123';
      const cachedProfile = {
        profile: { id: kolId, username: 'testuser' },
        recentCampaigns: [],
        certifications: {},
        categories: [],
      };

      vi.mocked(redisClient.get).mockResolvedValue(cachedProfile);

      const result = await kolService.getProfile(kolId);

      expect(result).toEqual(cachedProfile);
      expect(redisClient.get).toHaveBeenCalledWith(`kol:profile:${kolId}`);
      expect(prisma.kolProfile.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache miss', async () => {
      const kolId = 'kol-123';
      const mockProfile = {
        id: kolId,
        username: 'testuser',
        campaigns: [],
      };

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolProfile.findUnique).mockResolvedValue(mockProfile as any);

      const result = await kolService.getProfile(kolId);

      expect(prisma.kolProfile.findUnique).toHaveBeenCalledWith({
        where: { id: kolId },
        include: {
          campaigns: {
            where: { status: 'active' },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      expect(result.profile).toEqual(mockProfile);
    });

    it('should throw NotFoundError when profile does not exist', async () => {
      const kolId = 'nonexistent';

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolProfile.findUnique).mockResolvedValue(null);

      await expect(kolService.getProfile(kolId)).rejects.toThrow(NotFoundError);
    });

    it('should refresh data when profile is stale', async () => {
      const kolId = 'kol-123';
      const staleDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const mockProfile = {
        id: kolId,
        username: 'testuser',
        updatedAt: staleDate,
        campaigns: [],
        platformUserId: 'platform-123',
      };

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(crawlerManager.initialize).mockResolvedValue();
      vi.mocked(crawlerManager.newPage).mockResolvedValue({
        goto: vi.fn(),
        evaluate: vi.fn().mockResolvedValue({
          followerCount: 15000,
          followingCount: 500,
          postCount: 100,
        }),
        close: vi.fn(),
      } as any);

      await kolService.getProfile(kolId);

      expect(prisma.kolProfile.update).toHaveBeenCalled();
    });

    it('should handle crawler errors gracefully', async () => {
      const kolId = 'kol-123';
      const staleDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const mockProfile = {
        id: kolId,
        username: 'testuser',
        updatedAt: staleDate,
        campaigns: [],
        platformUserId: 'platform-123',
      };

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(crawlerManager.initialize).mockRejectedValue(new CrawlerError('Crawler failed'));

      // Should not throw, should return stale data
      const result = await kolService.getProfile(kolId);

      expect(result.profile).toEqual(mockProfile);
    });
  });

  describe('getAudience', () => {
    it('should return audience data with insights', async () => {
      const kolId = 'kol-123';
      const mockAudience = {
        id: 'aud-123',
        kolId,
        totalFollowers: 10000,
        interests: ['fashion', 'beauty', 'lifestyle'],
        engagementRate: 0.05,
      };

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolAudience.findFirst).mockResolvedValue(mockAudience as any);

      const result = await kolService.getAudience(kolId);

      expect(result.demographics).toEqual(mockAudience);
      expect(result.insights).toBeDefined();
      expect(result.insights.topInterests).toEqual(['fashion', 'beauty', 'lifestyle']);
      expect(result.insights.growthTrend).toBe('growing');
      expect(result.insights.engagementQuality).toBe('high');
    });

    it('should throw NotFoundError when audience data does not exist', async () => {
      const kolId = 'nonexistent';

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolAudience.findFirst).mockResolvedValue(null);

      await expect(kolService.getAudience(kolId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPerformance', () => {
    it('should return performance metrics with summary', async () => {
      const kolId = 'kol-123';
      const mockMetrics = [
        {
          id: 'perf-1',
          kolId,
          contentType: 'video',
          period: '30d',
          avgViews: 5000,
          avgLikes: 250,
          engagementRate: 0.05,
        },
        {
          id: 'perf-2',
          kolId,
          contentType: 'image',
          period: '30d',
          avgViews: 3000,
          avgLikes: 150,
          engagementRate: 0.05,
        },
      ];

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolPerformance.findMany).mockResolvedValue(mockMetrics as any);

      const result = await kolService.getPerformance(kolId);

      expect(result.metrics).toEqual(mockMetrics);
      expect(result.summary).toBeDefined();
      expect(result.summary.overallEngagementRate).toBe(0.05);
      expect(result.summary.topPerformingContentType).toBe('video');
    });

    it('should filter by content type and period', async () => {
      const kolId = 'kol-123';
      const mockMetrics = [
        {
          id: 'perf-1',
          kolId,
          contentType: 'video',
          period: '30d',
          engagementRate: 0.05,
        },
      ];

      vi.mocked(redisClient.get).mockResolvedValue(null);
      vi.mocked(prisma.kolPerformance.findMany).mockResolvedValue(mockMetrics as any);

      await kolService.getPerformance(kolId, 'video', '30d');

      expect(prisma.kolPerformance.findMany).toHaveBeenCalledWith({
        where: {
          kolId,
          contentType: 'video',
          period: '30d',
        },
        orderBy: { dataFreshness: 'desc' },
      });
    });
  });

  describe('invalidateKolCache', () => {
    it('should invalidate all KOL-related cache', async () => {
      const kolId = 'kol-123';

      vi.mocked(redisClient.invalidatePattern).mockResolvedValue();

      await kolService.invalidateKolCache(kolId);

      expect(redisClient.invalidatePattern).toHaveBeenCalledWith(`kol:*:${kolId}`);
    });

    it('should throw CacheError when invalidation fails', async () => {
      const kolId = 'kol-123';

      vi.mocked(redisClient.invalidatePattern).mockRejectedValue(new Error('Redis error'));

      await expect(kolService.invalidateKolCache(kolId)).rejects.toThrow('Failed to invalidate KOL cache');
    });
  });
});