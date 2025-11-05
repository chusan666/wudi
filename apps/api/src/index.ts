import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { routes } from '@/routes';
import { requestIdMiddleware } from '@/middleware/request-id';
import { loggerMiddleware } from '@/middleware/logger';
import { metricsMiddleware } from '@/middleware/metrics';
import { defaultRateLimit, crawlerRateLimit } from '@/middleware/rate-limit';
import { AppError } from '@/utils/errors';
import { errorResponse, createResponseMeta } from '@/utils/response';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { initializeTelemetry, shutdownTelemetry } from '@/config/telemetry';
import { healthService } from '@/services/health.service';
import { queueService, QUEUES } from '@/services/queue.service';
import { CommentService } from '@/services/comment.service';
import { RequestContext, HonoContext } from '@/types/hono';

// Extend Hono types
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    requestContext: RequestContext;
  }
}

const app = new Hono();

// Initialize OpenTelemetry
initializeTelemetry();

// Initialize background job processors
const commentService = new CommentService();

// Process cache refresh jobs
queueService.processJobs(
  QUEUES.CACHE_REFRESH,
  async (job) => {
    if (job.data.type === 'refresh-comments') {
      return commentService.processBackgroundRefreshJob(job.data);
    }
    
    return {
      success: false,
      error: `Unknown job type: ${job.data.type}`,
      duration: 0,
    };
  },
  2 // Process 2 jobs concurrently
);

// Global middleware (order matters)
app.use('*', cors());
app.use('*', requestIdMiddleware);
app.use('*', loggerMiddleware);
app.use('*', metricsMiddleware());
app.use('*', honoLogger());

// Apply rate limiting to all routes
app.use('*', defaultRateLimit);

// Apply stricter rate limiting to crawler endpoints
app.use('/api/notes/*/crawl', crawlerRateLimit);

// Register routes
app.route('/', routes);

// Health check endpoint
app.get('/health', async (c) => {
  try {
    const health = await healthService.checkHealth();
    return c.json(health, health.status === 'healthy' ? 200 : 503);
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Health check failed',
    });
    
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503);
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (c) => {
  // This will be handled by the Prometheus exporter
  return c.text('Metrics endpoint - handled by OpenTelemetry Prometheus exporter');
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

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info({
    signal,
    message: 'Received shutdown signal, starting graceful shutdown',
  });

  // Set timeout for graceful shutdown
  const shutdownTimeout = setTimeout(() => {
    logger.error({
      timeout: env.GRACEFUL_SHUTDOWN_TIMEOUT,
      message: 'Graceful shutdown timeout, forcing exit',
    });
    process.exit(1);
  }, env.GRACEFUL_SHUTDOWN_TIMEOUT);

  try {
    // Shutdown services in order
    await healthService.shutdown();
    await shutdownTelemetry();
    
    clearTimeout(shutdownTimeout);
    
    logger.info({
      signal,
      message: 'Graceful shutdown completed',
    });
    
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      signal,
      message: 'Error during graceful shutdown',
    });
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    message: 'Uncaught exception',
  });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    reason,
    promise,
    message: 'Unhandled promise rejection',
  });
  gracefulShutdown('unhandledRejection');
});

export default app;