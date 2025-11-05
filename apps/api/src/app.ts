import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getLogger } from '@/config/logger.js';
import { requestIdMiddleware } from '@/middleware/request-id.js';
import { loggerMiddleware } from '@/middleware/logger.js';
import { errorResponse } from '@/utils/response.js';
import { AppError, ValidationError, NotFoundError } from '@/types/errors.js';
import healthRoute from '@/routes/health.route.js';
import noteRoute from '@/routes/note.route.js';
import userRoute from '@/routes/user.route.js';

export function createApp() {
  const app = new Hono();

  // Global middleware
  app.use('*', cors());
  app.use('*', requestIdMiddleware);
  app.use('*', loggerMiddleware);

  // Routes
  app.route('/health', healthRoute);
  app.route('/api/notes', noteRoute);
  app.route('/api/users', userRoute);

  // Root endpoint
  app.get('/', (c) => {
    return c.json({
      name: 'Xiaohongshu API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        notes: '/api/notes/:id',
        users: '/api/users/:id',
        userNotes: '/api/users/:id/notes',
      },
    });
  });

  // Global error handler
  app.onError((err, c) => {
    const logger = getLogger();
    const requestId = c.get('requestId') || 'unknown';

    logger.error({
      requestId,
      error: err.message,
      stack: err.stack,
      path: c.req.path,
    }, 'Request error');

    if (err instanceof ValidationError) {
      return errorResponse(
        c,
        err.message,
        err.statusCode,
        err.code,
        err.details
      );
    }

    if (err instanceof NotFoundError) {
      return errorResponse(
        c,
        err.message,
        err.statusCode,
        err.code
      );
    }

    if (err instanceof AppError) {
      return errorResponse(
        c,
        err.message,
        err.statusCode,
        err.code
      );
    }

    // Unknown error
    return errorResponse(
      c,
      'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  });

  // 404 handler
  app.notFound((c) => {
    return errorResponse(
      c,
      `Route not found: ${c.req.method} ${c.req.path}`,
      404,
      'NOT_FOUND'
    );
  });

  return app;
}
