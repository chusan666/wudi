import { Context } from 'hono';
import { searchService } from '@services/search.service';
import { SearchQuerySchema, NoteSearchQuerySchema } from '@types/search';
import { rateLimiter } from '@utils/rate-limiter';
import { errorResponse } from '@utils/response';
import { logger } from '@config/logger';

export class SearchController {
  async searchUsers(c: Context) {
    try {
      const query = SearchQuerySchema.parse(c.req.query());
      const requestContext = c.get('requestContext');
      
      // Rate limiting per IP and keyword
      const rateLimitKey = rateLimiter.generateKey(requestContext.ip || 'unknown', query.q);
      const rateLimitResult = await rateLimiter.isAllowed(rateLimitKey);
      
      if (!rateLimitResult.allowed) {
        c.header('X-RateLimit-Limit', rateLimitResult.limit.toString());
        c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());
        
        return c.json(errorResponse('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED'), 429);
      }

      c.header('X-RateLimit-Limit', rateLimitResult.limit.toString());
      c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());

      const result = await searchService.searchUsers(
        query, 
        requestContext.ip, 
        requestContext.userAgent
      );
      
      return c.json(result);
    } catch (error) {
      logger.error('User search controller error', { error });
      
      if (error instanceof Error && error.message.includes('Query parameter is required')) {
        return c.json(errorResponse('Query parameter is required and must be at least 1 character long', 'INVALID_QUERY'), 400);
      }
      
      return c.json(errorResponse('Internal server error', 'INTERNAL_ERROR'), 500);
    }
  }

  async searchNotes(c: Context) {
    try {
      const query = NoteSearchQuerySchema.parse(c.req.query());
      const requestContext = c.get('requestContext');
      
      // Rate limiting per IP and keyword
      const rateLimitKey = rateLimiter.generateKey(requestContext.ip || 'unknown', query.q);
      const rateLimitResult = await rateLimiter.isAllowed(rateLimitKey);
      
      if (!rateLimitResult.allowed) {
        c.header('X-RateLimit-Limit', rateLimitResult.limit.toString());
        c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());
        
        return c.json(errorResponse('Rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED'), 429);
      }

      c.header('X-RateLimit-Limit', rateLimitResult.limit.toString());
      c.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      c.header('X-RateLimit-Reset', rateLimitResult.reset.toString());

      const result = await searchService.searchNotes(
        query, 
        requestContext.ip, 
        requestContext.userAgent
      );
      
      return c.json(result);
    } catch (error) {
      logger.error('Note search controller error', { error });
      
      if (error instanceof Error && error.message.includes('Query parameter is required')) {
        return c.json(errorResponse('Query parameter is required and must be at least 1 character long', 'INVALID_QUERY'), 400);
      }
      
      return c.json(errorResponse('Internal server error', 'INTERNAL_ERROR'), 500);
    }
  }
}

export const searchController = new SearchController();