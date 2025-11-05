import { Context, Next } from 'hono';
import { logger } from '@config/logger';
import { v4 as uuidv4 } from 'uuid';

export interface RequestContext {
  id: string;
  startTime: number;
}

declare module 'hono' {
  interface ContextVariableMap {
    requestContext: RequestContext;
  }
}

export function requestId() {
  return async (c: Context, next: Next) => {
    const requestId = c.get('x-request-id') || uuidv4();
    const requestContext: RequestContext = {
      id: requestId,
      startTime: Date.now(),
    };

    c.set('requestContext', requestContext);
    c.header('X-Request-ID', requestId);

    await next();
  };
}

export function loggerMiddleware() {
  return async (c: Context, next: Next) => {
    const requestContext = c.get('requestContext');
    if (!requestContext) {
      await next();
      return;
    }

    const start = Date.now();
    const method = c.req.method;
    const url = c.req.url;
    const userAgent = c.req.header('User-Agent') || 'Unknown';
    const ip = c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'Unknown';

    logger.info('Request started', {
      requestId: requestContext.id,
      method,
      url,
      userAgent,
      ip,
    });

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    logger.info('Request completed', {
      requestId: requestContext.id,
      method,
      url,
      status,
      duration,
    });
  };
}

export function errorHandler(err: Error, c: Context) {
  const requestContext = c.get('requestContext');
  
  logger.error('Unhandled error', {
    requestId: requestContext?.id,
    error: err.message,
    stack: err.stack,
  });

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestContext?.id,
    },
  }, 500);
}