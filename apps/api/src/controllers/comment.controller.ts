import { Context } from 'hono';
import { CommentService } from '@/services/comment.service';
import { ValidationError } from '@/utils/errors';
import { successResponse, createResponseMeta } from '@/utils/response';
import { CommentsQueryParams } from '@/types';

// Extend Hono types for this controller
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    requestContext: { requestId: string };
  }
}

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  async getCommentsByNoteId(c: Context) {
    const noteId = c.req.param('id');
    const requestId = c.get('requestContext')?.requestId || 'unknown';

    if (!noteId) {
      throw new ValidationError('Note ID is required');
    }

    // Parse and validate query parameters
    const queryParams = this.parseQueryParams(c.req.query());
    
    const result = await this.commentService.getCommentsByNoteId(noteId, queryParams);

    return c.json(successResponse(result, createResponseMeta(requestId)), 200);
  }

  private parseQueryParams(query: Record<string, string>): CommentsQueryParams {
    const params: CommentsQueryParams = {};

    // Pagination params
    if (query.page) {
      const page = parseInt(query.page, 10);
      if (isNaN(page) || page < 1) {
        throw new ValidationError('Page must be a positive integer');
      }
      params.page = page;
    }

    if (query.pageSize) {
      const pageSize = parseInt(query.pageSize, 10);
      if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new ValidationError('Page size must be between 1 and 100');
      }
      params.pageSize = pageSize;
    }

    if (query.order) {
      if (!['asc', 'desc'].includes(query.order)) {
        throw new ValidationError('Order must be either "asc" or "desc"');
      }
      params.order = query.order as 'asc' | 'desc';
    }

    // Filter params
    if (query.minLikes) {
      const minLikes = parseInt(query.minLikes, 10);
      if (isNaN(minLikes) || minLikes < 0) {
        throw new ValidationError('Min likes must be a non-negative integer');
      }
      params.minLikes = minLikes;
    }

    if (query.hasReplies) {
      if (query.hasReplies === 'true') {
        params.hasReplies = true;
      } else if (query.hasReplies === 'false') {
        params.hasReplies = false;
      } else {
        throw new ValidationError('Has replies must be either "true" or "false"');
      }
    }

    // Cache control
    if (query.refresh) {
      if (query.refresh === 'true') {
        params.refresh = true;
      } else if (query.refresh === 'false') {
        params.refresh = false;
      } else {
        throw new ValidationError('Refresh must be either "true" or "false"');
      }
    }

    return params;
  }
}