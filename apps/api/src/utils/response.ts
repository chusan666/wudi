import { Context } from 'hono';
import { PaginationMeta } from '@types/search';

export function successResponse<T>(data: T, meta?: any) {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(message: string, code?: string, details?: any) {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function extractSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  const queryIndex = contentLower.indexOf(queryLower);
  
  if (queryIndex === -1) {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }
  
  const start = Math.max(0, queryIndex - 50);
  const end = Math.min(content.length, queryIndex + query.length + 50);
  
  let snippet = content.substring(start, end);
  
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}