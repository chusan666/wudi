import { Hono } from 'hono';
import { KolController } from '@controllers/kol.controller';
import { kolCache } from '@middleware/cache';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KolQuerySchema } from '@types/kol';

const kolRoutes = new Hono();
const kolController = new KolController();

// Validation schemas
const KolIdSchema = z.object({
  id: z.string().min(1, 'KOL ID is required'),
});

const PerformanceQuerySchema = z.object({
  contentType: z.string().optional(),
  period: z.string().optional(),
});

const ConversionQuerySchema = z.object({
  campaignId: z.string().optional(),
});

const MarketingIndexQuerySchema = z.object({
  indexType: z.string().optional(),
});

// KOL Profile endpoint
kolRoutes.get(
  '/:id/profile',
  zValidator('param', KolIdSchema),
  kolCache('profile'),
  kolController.getProfile.bind(kolController)
);

// KOL Pricing endpoint
kolRoutes.get(
  '/:id/pricing',
  zValidator('param', KolIdSchema),
  kolCache('pricing'),
  kolController.getPricing.bind(kolController)
);

// KOL Audience endpoint
kolRoutes.get(
  '/:id/audience',
  zValidator('param', KolIdSchema),
  kolCache('audience'),
  kolController.getAudience.bind(kolController)
);

// KOL Performance endpoint
kolRoutes.get(
  '/:id/performance',
  zValidator('param', KolIdSchema),
  zValidator('query', PerformanceQuerySchema),
  kolCache('performance'),
  kolController.getPerformance.bind(kolController)
);

// KOL Conversion endpoint
kolRoutes.get(
  '/:id/conversion',
  zValidator('param', KolIdSchema),
  zValidator('query', ConversionQuerySchema),
  kolCache('conversion'),
  kolController.getConversion.bind(kolController)
);

// KOL Marketing Index endpoint
kolRoutes.get(
  '/:id/marketing-index',
  zValidator('param', KolIdSchema),
  zValidator('query', MarketingIndexQuerySchema),
  kolCache('marketing-index'),
  kolController.getMarketingIndex.bind(kolController)
);

// Cache refresh endpoint (admin only)
kolRoutes.post(
  '/:id/refresh-cache',
  zValidator('param', KolIdSchema),
  kolController.refreshCache.bind(kolController)
);

export default kolRoutes;