import { prisma, handleDatabaseError } from '@data-access/prisma';
import { redisClient, cacheKeys } from '@data-access/redis';
import { crawlerManager, XiaohongshuCrawler } from '@data-access/crawler';
import { logger } from '@config/logger';
import { NotFoundError, CrawlerError, CacheError } from '@utils/errors';
import { 
  KolProfile, 
  KolProfileResponse, 
  KolPricingResponse,
  KolAudienceResponse,
  KolPerformanceResponse,
  KolConversionResponse,
  KolMarketingIndexResponse
} from '@types/kol';

export class KolService {
  private xiaohongshuCrawler: XiaohongshuCrawler;

  constructor() {
    this.xiaohongshuCrawler = new XiaohongshuCrawler();
  }

  // Profile Service
  async getProfile(kolId: string, forceRefresh: boolean = false): Promise<KolProfileResponse> {
    const cacheKey = cacheKeys.kolProfile(kolId);

    // Try cache first unless force refresh
    if (!forceRefresh) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug('Profile cache hit', { kolId });
          return cached;
        }
      } catch (error) {
        logger.warn('Failed to get profile from cache', { kolId, error });
      }
    }

    try {
      // Get from database
      const profile = await prisma.kolProfile.findUnique({
        where: { id: kolId },
        include: {
          campaigns: {
            where: { status: 'active' },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!profile) {
        throw new NotFoundError('KOL profile', kolId);
      }

      // Check if data needs refresh (older than 1 hour)
      const dataAge = Date.now() - profile.updatedAt.getTime();
      const needsRefresh = dataAge > 3600000; // 1 hour

      if (needsRefresh || forceRefresh) {
        logger.info('Refreshing KOL profile data', { kolId });
        await this.refreshProfileData(profile);
      }

      const response: KolProfileResponse = {
        profile,
        recentCampaigns: profile.campaigns,
        certifications: profile.certifications,
        categories: profile.categories,
      };

      // Cache the response
      try {
        await redisClient.set(cacheKey, response, 3600); // 1 hour
      } catch (error) {
        logger.warn('Failed to cache profile', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Pricing Service
  async getPricing(kolId: string): Promise<KolPricingResponse> {
    const cacheKey = cacheKeys.kolPricing(kolId);

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Pricing cache hit', { kolId });
        return cached;
      }
    } catch (error) {
      logger.warn('Failed to get pricing from cache', { kolId, error });
    }

    try {
      const [currentPricing, pricingHistory, cooperationHistory] = await Promise.all([
        prisma.kolPricing.findMany({
          where: { 
            kolId, 
            isActive: true,
            validTo: { gte: new Date() }
          },
          orderBy: { validFrom: 'desc' },
        }),
        prisma.kolPricing.findMany({
          where: { kolId },
          orderBy: { validFrom: 'desc' },
          take: 20,
        }),
        prisma.kolCampaign.findMany({
          where: { kolId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      const response: KolPricingResponse = {
        currentPricing,
        pricingHistory,
        cooperationHistory,
      };

      // Cache for 30 minutes
      try {
        await redisClient.set(cacheKey, response, 1800);
      } catch (error) {
        logger.warn('Failed to cache pricing', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Audience Service
  async getAudience(kolId: string): Promise<KolAudienceResponse> {
    const cacheKey = cacheKeys.kolAudience(kolId);

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Audience cache hit', { kolId });
        return cached;
      }
    } catch (error) {
      logger.warn('Failed to get audience from cache', { kolId, error });
    }

    try {
      const demographics = await prisma.kolAudience.findFirst({
        where: { kolId },
        orderBy: { dataFreshness: 'desc' },
      });

      if (!demographics) {
        throw new NotFoundError('Audience data for KOL', kolId);
      }

      // Generate insights
      const insights = this.generateAudienceInsights(demographics);

      const response: KolAudienceResponse = {
        demographics,
        insights,
      };

      // Cache for 2 hours
      try {
        await redisClient.set(cacheKey, response, 7200);
      } catch (error) {
        logger.warn('Failed to cache audience', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Performance Service
  async getPerformance(kolId: string, contentType?: string, period?: string): Promise<KolPerformanceResponse> {
    const cacheKey = cacheKeys.kolPerformance(kolId, contentType, period);

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Performance cache hit', { kolId });
        return cached;
      }
    } catch (error) {
      logger.warn('Failed to get performance from cache', { kolId, error });
    }

    try {
      const whereClause: any = { kolId };
      if (contentType) whereClause.contentType = contentType;
      if (period) whereClause.period = period;

      const metrics = await prisma.kolPerformance.findMany({
        where: whereClause,
        orderBy: { dataFreshness: 'desc' },
      });

      if (metrics.length === 0) {
        throw new NotFoundError('Performance data for KOL', kolId);
      }

      const summary = this.generatePerformanceSummary(metrics);

      const response: KolPerformanceResponse = {
        metrics,
        summary,
      };

      // Cache for 30 minutes
      try {
        await redisClient.set(cacheKey, response, 1800);
      } catch (error) {
        logger.warn('Failed to cache performance', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Conversion Service
  async getConversion(kolId: string, campaignId?: string): Promise<KolConversionResponse> {
    const cacheKey = cacheKeys.kolConversion(kolId, campaignId);

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Conversion cache hit', { kolId });
        return cached;
      }
    } catch (error) {
      logger.warn('Failed to get conversion from cache', { kolId, error });
    }

    try {
      const whereClause: any = { kolId };
      if (campaignId) whereClause.campaignId = campaignId;

      const conversionMetrics = await prisma.kolConversion.findMany({
        where: whereClause,
        orderBy: { dataFreshness: 'desc' },
      });

      const summary = this.generateConversionSummary(conversionMetrics);

      const response: KolConversionResponse = {
        conversionMetrics,
        summary,
      };

      // Cache for 1 hour
      try {
        await redisClient.set(cacheKey, response, 3600);
      } catch (error) {
        logger.warn('Failed to cache conversion', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Marketing Index Service
  async getMarketingIndex(kolId: string, indexType?: string): Promise<KolMarketingIndexResponse> {
    const cacheKey = cacheKeys.kolMarketingIndex(kolId, indexType);

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.debug('Marketing index cache hit', { kolId });
        return cached;
      }
    } catch (error) {
      logger.warn('Failed to get marketing index from cache', { kolId, error });
    }

    try {
      const whereClause: any = { kolId };
      if (indexType) whereClause.indexType = indexType;

      const indices = await prisma.kolMarketingIndex.findMany({
        where: whereClause,
        orderBy: { calculationDate: 'desc' },
      });

      if (indices.length === 0) {
        throw new NotFoundError('Marketing index data for KOL', kolId);
      }

      const trends = this.generateMarketingTrends(indices);

      const response: KolMarketingIndexResponse = {
        indices,
        trends,
      };

      // Cache for 15 minutes
      try {
        await redisClient.set(cacheKey, response, 900);
      } catch (error) {
        logger.warn('Failed to cache marketing index', { kolId, error });
      }

      return response;
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  // Data refresh methods
  private async refreshProfileData(profile: any): Promise<void> {
    try {
      const crawlerData = await this.xiaohongshuCrawler.extractKolProfile(profile.platformUserId);
      
      await prisma.kolProfile.update({
        where: { id: profile.id },
        data: {
          followerCount: crawlerData.followerCount,
          followingCount: crawlerData.followingCount,
          postCount: crawlerData.postCount,
          bio: crawlerData.bio,
          updatedAt: new Date(),
        },
      });

      // Invalidate related cache
      await redisClient.invalidatePattern(cacheKeys.kolAll(profile.id));
      
      logger.info('Profile data refreshed successfully', { kolId: profile.id });
    } catch (error) {
      if (error instanceof CrawlerError) {
        logger.warn('Failed to refresh profile data from crawler', { 
          kolId: profile.id, 
          error: error.message 
        });
        // Don't throw - allow stale data to be returned
      } else {
        throw error;
      }
    }
  }

  // Insight generation methods
  private generateAudienceInsights(demographics: any): any {
    const interests = demographics.interests || [];
    const topInterests = interests.slice(0, 5);
    
    let growthTrend = 'stable';
    if (demographics.engagementRate > 0.05) growthTrend = 'growing';
    else if (demographics.engagementRate < 0.02) growthTrend = 'declining';

    let engagementQuality = 'average';
    if (demographics.engagementRate > 0.08) engagementQuality = 'high';
    else if (demographics.engagementRate < 0.03) engagementQuality = 'low';

    return {
      topInterests,
      growthTrend,
      engagementQuality,
    };
  }

  private generatePerformanceSummary(metrics: any[]): any {
    const totalEngagementRate = metrics.reduce((sum, m) => sum + Number(m.engagementRate), 0) / metrics.length;
    
    const contentTypeStats = metrics.reduce((acc, m) => {
      acc[m.contentType] = (acc[m.contentType] || 0) + Number(m.engagementRate);
      return acc;
    }, {} as Record<string, number>);

    const topPerformingContentType = Object.entries(contentTypeStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown';

    return {
      overallEngagementRate: totalEngagementRate,
      topPerformingContentType,
      growthMetrics: {
        avgViews: metrics.reduce((sum, m) => sum + m.avgViews, 0) / metrics.length,
        avgLikes: metrics.reduce((sum, m) => sum + m.avgLikes, 0) / metrics.length,
      },
    };
  }

  private generateConversionSummary(conversionMetrics: any[]): any {
    const totalConversions = conversionMetrics.reduce((sum, m) => sum + m.totalConversions, 0);
    const avgConversionRate = conversionMetrics.reduce((sum, m) => sum + Number(m.conversionRate), 0) / conversionMetrics.length;
    const totalRevenue = conversionMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);

    const roi = totalRevenue > 0 ? (totalRevenue / (totalRevenue * 0.3)) * 100 : 0; // Assuming 30% cost

    return {
      totalConversions,
      avgConversionRate,
      totalRevenue,
      roi,
    };
  }

  private generateMarketingTrends(indices: any[]): any {
    const redIndex = indices.find(i => i.indexType === 'RED');
    const growthIndex = indices.find(i => i.indexType === 'growth');
    const influenceIndex = indices.find(i => i.indexType === 'influence');

    return {
      redIndex: {
        current: redIndex?.indexValue || 0,
        rank: redIndex?.indexRank || 0,
        trend: redIndex?.trendDirection || 'stable',
      },
      growthIndex: {
        current: growthIndex?.indexValue || 0,
        trend: growthIndex?.trendDirection || 'stable',
      },
      influenceIndex: {
        current: influenceIndex?.indexValue || 0,
        trend: influenceIndex?.trendDirection || 'stable',
      },
    };
  }

  // Cache invalidation
  async invalidateKolCache(kolId: string): Promise<void> {
    try {
      await redisClient.invalidatePattern(cacheKeys.kolAll(kolId));
      logger.info('KOL cache invalidated', { kolId });
    } catch (error) {
      logger.error('Failed to invalidate KOL cache', { kolId, error });
      throw new CacheError('Failed to invalidate KOL cache');
    }
  }
}