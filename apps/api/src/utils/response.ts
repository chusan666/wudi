import type { Context } from 'hono';
import type { SuccessResponse, ErrorResponse } from '@/types/api.js';

export function successResponse<T>(
  c: Context,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: c.get('requestId'),
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return c.json(response, statusCode);
}

export function errorResponse(
  c: Context,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): Response {
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      requestId: c.get('requestId'),
      timestamp: new Date().toISOString(),
    },
  };

  return c.json(response, statusCode);
}
