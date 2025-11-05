import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { requestId, loggerMiddleware, errorHandler } from '@middleware/request';
import kolRoutes from '@routes/kol.routes';
import healthRoutes from '@routes/health.routes';
import { logger } from '@config/logger';
import { redisClient } from '@data-access/redis';
import { crawlerManager } from '@data-access/crawler';
import { env } from '@config/env';

const app = new Hono();

// Global middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

app.use('*', requestId());
app.use('*', honoLogger());
app.use('*', loggerMiddleware());

// Global error handler
app.onError(errorHandler);

// Routes
app.route('/health', healthRoutes);
app.route('/api/kol', kolRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'KOL Analytics API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      kol: {
        profile: '/api/kol/:id/profile',
        pricing: '/api/kol/:id/pricing',
        audience: '/api/kol/:id/audience',
        performance: '/api/kol/:id/performance',
        conversion: '/api/kol/:id/conversion',
        marketingIndex: '/api/kol/:id/marketing-index',
      },
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: c.get('requestContext')?.id,
    },
  }, 404);
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize Redis
    await redisClient.connect();
    logger.info('Redis connected successfully');

    // Initialize crawler (optional - will be initialized on first use)
    if (env.CRAWLER_USERNAME && env.CRAWLER_PASSWORD) {
      await crawlerManager.initialize();
      logger.info('Crawler initialized successfully');
    } else {
      logger.info('Crawler credentials not provided, skipping initialization');
    }

    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await redisClient.disconnect();
    await crawlerManager.close();
    logger.info('Services shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await redisClient.disconnect();
    await crawlerManager.close();
    logger.info('Services shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
const port = env.PORT;
initializeServices().then(() => {
  logger.info(`Server starting on port ${port}`);
  
  // For Bun runtime
  if (typeof Bun !== 'undefined') {
    Bun.serve({
      port,
      fetch: app.fetch,
    });
  } else {
    // For Node.js (fallback)
    app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
  }
});

export default app;