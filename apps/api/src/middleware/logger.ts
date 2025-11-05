import { Context, Next } from 'hono';
import { logger } from '@config/logger';

export async function loggerMiddleware(c: Context, next: Next) {
  const requestContext = c.get('requestContext');
  const startTime = Date.now();
  
  logger.info('Request started', {
    requestId: requestContext?.id,
    method: c.req.method,
    url: c.req.url,
    userAgent: requestContext?.userAgent,
    ip: requestContext?.ip,
  });

  await next();

  const duration = Date.now() - startTime;
  
  logger.info('Request completed', {
    requestId: requestContext?.id,
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration,
  });
}