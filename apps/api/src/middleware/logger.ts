import { Context, Next } from 'hono';
import { logger } from '@/config/logger';

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const requestContext = c.get('requestContext');
  const requestId = requestContext?.requestId || 'unknown';

  // Log request
  logger.info({
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    requestId,
    type: 'request',
  });

  await next();

  const duration = Date.now() - start;

  // Log response
  logger.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    requestId,
    type: 'response',
  });
};