import { Context } from 'hono';
import { z } from 'zod';
import { KolService } from '@services/kol.service';
import { successResponse, errorResponse } from '@utils/response';
import { ValidationError, NotFoundError } from '@utils/errors';
import { KolQuerySchema } from '@types/kol';

export class KolController {
  private kolService: KolService;

  constructor() {
    this.kolService = new KolService();
  }

  // GET /api/kol/:id/profile
  async getProfile(c: Context) {
    try {
      const { id } = c.req.param();
      const forceRefresh = c.req.query('refresh') === 'true';

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getProfile(id, forceRefresh);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL profile',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // GET /api/kol/:id/pricing
  async getPricing(c: Context) {
    try {
      const { id } = c.req.param();

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getPricing(id);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL pricing',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // GET /api/kol/:id/audience
  async getAudience(c: Context) {
    try {
      const { id } = c.req.param();

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getAudience(id);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL audience data',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // GET /api/kol/:id/performance
  async getPerformance(c: Context) {
    try {
      const { id } = c.req.param();
      const query = {
        contentType: c.req.query('contentType'),
        period: c.req.query('period'),
      };

      const validatedQuery = KolQuerySchema.omit({ id: true }).parse(query);

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getPerformance(id, validatedQuery.contentType, validatedQuery.period);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(errorResponse(
          'VALIDATION_ERROR',
          'Invalid query parameters',
          error.errors,
          { requestId: c.get('requestContext')?.id }
        ), 400);
      }

      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL performance data',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // GET /api/kol/:id/conversion
  async getConversion(c: Context) {
    try {
      const { id } = c.req.param();
      const query = {
        campaignId: c.req.query('campaignId'),
      };

      const validatedQuery = KolQuerySchema.omit({ id: true }).parse(query);

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getConversion(id, validatedQuery.campaignId);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(errorResponse(
          'VALIDATION_ERROR',
          'Invalid query parameters',
          error.errors,
          { requestId: c.get('requestContext')?.id }
        ), 400);
      }

      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL conversion data',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // GET /api/kol/:id/marketing-index
  async getMarketingIndex(c: Context) {
    try {
      const { id } = c.req.param();
      const query = {
        indexType: c.req.query('indexType'),
      };

      const validatedQuery = KolQuerySchema.omit({ id: true }).parse(query);

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      const data = await this.kolService.getMarketingIndex(id, validatedQuery.indexType);
      
      return c.json(successResponse(data, {
        requestId: c.get('requestContext')?.id,
      }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(errorResponse(
          'VALIDATION_ERROR',
          'Invalid query parameters',
          error.errors,
          { requestId: c.get('requestContext')?.id }
        ), 400);
      }

      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      if (error instanceof NotFoundError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          undefined,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve KOL marketing index',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }

  // POST /api/kol/:id/refresh-cache
  async refreshCache(c: Context) {
    try {
      const { id } = c.req.param();

      if (!id) {
        throw new ValidationError('KOL ID is required');
      }

      await this.kolService.invalidateKolCache(id);
      
      return c.json(successResponse(
        { message: 'Cache invalidated successfully' },
        { requestId: c.get('requestContext')?.id }
      ));
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json(errorResponse(
          error.code,
          error.message,
          error.details,
          { requestId: c.get('requestContext')?.id }
        ), error.statusCode);
      }

      return c.json(errorResponse(
        'INTERNAL_SERVER_ERROR',
        'Failed to refresh KOL cache',
        undefined,
        { requestId: c.get('requestContext')?.id }
      ), 500);
    }
  }
}