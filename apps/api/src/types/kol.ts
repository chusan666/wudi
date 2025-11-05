import { z } from 'zod';

// Base KOL profile types
export const KolProfileSchema = z.object({
  id: z.string(),
  platform: z.string(),
  platformUserId: z.string(),
  username: z.string(),
  displayName: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  verified: z.boolean().default(false),
  verificationType: z.string().optional(),
  followerCount: z.number().default(0),
  followingCount: z.number().default(0),
  postCount: z.number().default(0),
  categories: z.array(z.string()),
  certifications: z.any().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  contactEmail: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolProfile = z.infer<typeof KolProfileSchema>;

// Pricing types
export const KolPricingSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  serviceType: z.string(),
  basePrice: z.number(),
  currency: z.string().default('CNY'),
  priceUnit: z.string().default('per_post'),
  minFollowers: z.number().optional(),
  maxFollowers: z.number().optional(),
  engagementRate: z.number().optional(),
  validFrom: z.date(),
  validTo: z.date().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolPricing = z.infer<typeof KolPricingSchema>;

// Campaign types
export const KolCampaignSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  campaignName: z.string(),
  brand: z.string(),
  campaignType: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number().optional(),
  currency: z.string().default('CNY'),
  status: z.string().default('active'),
  deliverables: z.any().optional(),
  metrics: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolCampaign = z.infer<typeof KolCampaignSchema>;

// Audience types
export const KolAudienceSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  totalFollowers: z.number().default(0),
  genderDistribution: z.any().optional(),
  ageDistribution: z.any().optional(),
  locationDistribution: z.any().optional(),
  interests: z.array(z.string()),
  languages: z.array(z.string()),
  engagementRate: z.number().default(0),
  avgSessionTime: z.number().optional(),
  dataFreshness: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolAudience = z.infer<typeof KolAudienceSchema>;

// Performance types
export const KolPerformanceSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  contentType: z.string(),
  period: z.string(),
  avgViews: z.number().default(0),
  avgLikes: z.number().default(0),
  avgComments: z.number().default(0),
  avgShares: z.number().default(0),
  avgSaves: z.number().default(0),
  engagementRate: z.number().default(0),
  reach: z.number().optional(),
  impressions: z.number().optional(),
  videoCompletionRate: z.number().optional(),
  clickThroughRate: z.number().optional(),
  conversionRate: z.number().optional(),
  dataFreshness: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolPerformance = z.infer<typeof KolPerformanceSchema>;

// Conversion types
export const KolConversionSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  campaignId: z.string().optional(),
  conversionType: z.string(),
  period: z.string(),
  totalConversions: z.number().default(0),
  conversionRate: z.number().default(0),
  avgOrderValue: z.number().optional(),
  revenue: z.number().optional(),
  costPerAcquisition: z.number().optional(),
  returnOnAdSpend: z.number().optional(),
  attributionModel: z.string().default('last_click'),
  dataFreshness: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolConversion = z.infer<typeof KolConversionSchema>;

// Marketing Index types
export const KolMarketingIndexSchema = z.object({
  id: z.string(),
  kolId: z.string(),
  indexType: z.string(),
  indexValue: z.number(),
  indexRank: z.number().optional(),
  percentile: z.number().optional(),
  trendDirection: z.string().default('stable'),
  trendChange: z.number().optional(),
  category: z.string().optional(),
  platform: z.string(),
  calculationDate: z.date(),
  dataFreshness: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KolMarketingIndex = z.infer<typeof KolMarketingIndexSchema>;

// API Request/Response types
export const KolProfileRequestSchema = z.object({
  id: z.string(),
});

export const KolProfileResponseSchema = z.object({
  profile: KolProfileSchema,
  recentCampaigns: z.array(KolCampaignSchema).optional(),
  certifications: z.any().optional(),
  categories: z.array(z.string()),
});

export type KolProfileResponse = z.infer<typeof KolProfileResponseSchema>;

export const KolPricingResponseSchema = z.object({
  currentPricing: z.array(KolPricingSchema),
  pricingHistory: z.array(KolPricingSchema),
  cooperationHistory: z.array(KolCampaignSchema),
});

export type KolPricingResponse = z.infer<typeof KolPricingResponseSchema>;

export const KolAudienceResponseSchema = z.object({
  demographics: KolAudienceSchema,
  insights: z.object({
    topInterests: z.array(z.string()),
    growthTrend: z.string(),
    engagementQuality: z.string(),
  }).optional(),
});

export type KolAudienceResponse = z.infer<typeof KolAudienceResponseSchema>;

export const KolPerformanceResponseSchema = z.object({
  metrics: z.array(KolPerformanceSchema),
  summary: z.object({
    overallEngagementRate: z.number(),
    topPerformingContentType: z.string(),
    growthMetrics: z.any(),
  }),
});

export type KolPerformanceResponse = z.infer<typeof KolPerformanceResponseSchema>;

export const KolConversionResponseSchema = z.object({
  conversionMetrics: z.array(KolConversionSchema),
  summary: z.object({
    totalConversions: z.number(),
    avgConversionRate: z.number(),
    totalRevenue: z.number(),
    roi: z.number(),
  }),
});

export type KolConversionResponse = z.infer<typeof KolConversionResponseSchema>;

export const KolMarketingIndexResponseSchema = z.object({
  indices: z.array(KolMarketingIndexSchema),
  trends: z.object({
    redIndex: z.object({
      current: z.number(),
      rank: z.number(),
      trend: z.string(),
    }),
    growthIndex: z.object({
      current: z.number(),
      trend: z.string(),
    }),
    influenceIndex: z.object({
      current: z.number(),
      trend: z.string(),
    }),
  }),
});

export type KolMarketingIndexResponse = z.infer<typeof KolMarketingIndexResponseSchema>;

// Query parameter schemas
export const KolQuerySchema = z.object({
  id: z.string(),
  period: z.string().optional(),
  contentType: z.string().optional(),
  campaignId: z.string().optional(),
  indexType: z.string().optional(),
});

export type KolQuery = z.infer<typeof KolQuerySchema>;