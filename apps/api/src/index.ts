import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { routes } from '@/routes';
import { requestIdMiddleware } from '@/middleware/request-id';
import { loggerMiddleware } from '@/middleware/logger';
import { AppError } from '@/utils/errors';
import { errorResponse, createResponseMeta } from '@/utils/response';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { RequestContext, HonoContext } from '@/types/hono';

// Extend Hono types
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    requestContext: RequestContext;
  }
}

const app = new Hono();

// Global middleware
app.use('*', cors());
app.use('*', requestIdMiddleware);
app.use('*', loggerMiddleware);
app.use('*', honoLogger());

// Register routes
app.route('/', routes);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Global error handler
app.onError((err, c) => {
  const requestId = c.get('requestContext')?.requestId || 'unknown';

  // Log the error
  logger.error({
    error: err.message,
    stack: err.stack,
    requestId,
    type: 'request_error',
  });

  // Handle custom errors
  if (err instanceof AppError) {
    return c.json(
      errorResponse(
        {
          message: err.message,
          code: err.code,
        },
        createResponseMeta(requestId)
      ),
      err.statusCode as any
    );
  }

  // Handle validation errors (like from Zod)
  if (err.name === 'ZodError') {
    return c.json(
      errorResponse(
        {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
        },
        createResponseMeta(requestId)
      ),
      400
    );
  }

  // Handle unknown errors
  return c.json(
    errorResponse(
      {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      createResponseMeta(requestId)
    ),
    500
  );
});

// 404 handler
app.notFound((c) => {
  const requestId = c.get('requestContext')?.requestId || 'unknown';
  
  return c.json(
    errorResponse(
      {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
      createResponseMeta(requestId)
    ),
    404
  );
});

// Start server
const port = env.PORT;
logger.info({
  port,
  env: env.NODE_ENV,
  message: 'Starting API server',
});

export default app;