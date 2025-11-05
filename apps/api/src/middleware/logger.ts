import type { MiddlewareHandler } from 'hono';
import { getLogger } from '@/config/logger.js';

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const logger = getLogger();
  const requestId = c.get('requestId') || 'unknown';
  const method = c.req.method;
  const path = c.req.path;
  const startTime = Date.now();

  logger.info({
    requestId,
    method,
    path,
    msg: 'Request started',
  });

  await next();

  const duration = Date.now() - startTime;
  const status = c.res.status;

  logger.info({
    requestId,
    method,
    path,
    status,
    duration,
    msg: 'Request completed',
  });
};
