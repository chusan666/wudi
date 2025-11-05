import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { connectDatabase, connectRedis } from '@repo/db';
import { logger } from '@config/logger';
import { config } from '@config/env';
import { HonoEnv } from '@types/context';
import { requestContextMiddleware } from '@middleware/request-context';
import { loggerMiddleware } from '@middleware/logger';
import searchRoutes from '@routes/search.routes';
import healthRoutes from '@routes/health.routes';

class App {
  public app: Hono<HonoEnv>;

  constructor() {
    this.app = new Hono<HonoEnv>();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // CORS middleware
    this.app.use('*', cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }));

    // Request logging middleware (only in development)
    if (config.env === 'development') {
      this.app.use('*', honoLogger());
    }

    // Request context middleware (must run first)
    this.app.use('*', requestContextMiddleware);

    // Application logger middleware
    this.app.use('*', loggerMiddleware);
  }

  private initializeRoutes() {
    // API routes
    this.app.route('/api/search', searchRoutes);
    this.app.route('/', healthRoutes);

    // Root endpoint
    this.app.get('/', (c) => {
      return c.json({
        name: 'Search API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/health',
          ready: '/ready',
          searchUsers: '/api/search/users?q=keyword&page=1&pageSize=20&sort=relevance',
          searchNotes: '/api/search/notes?q=keyword&page=1&pageSize=20&sort=relevance&topic=optional',
        },
      });
    });
  }

  private initializeErrorHandling() {
    this.app.onError((err, c) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        requestId: c.get('requestContext')?.id,
      });

      return c.json({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          ...(config.env === 'development' && { details: err.message, stack: err.stack }),
        },
      }, 500);
    });

    this.app.notFound((c) => {
      return c.json({
        success: false,
        error: {
          message: 'Endpoint not found',
          code: 'NOT_FOUND',
        },
      }, 404);
    });
  }

  async start() {
    try {
      logger.info('Starting Search API server...');

      // Connect to database and Redis
      await connectDatabase();
      await connectRedis();

      logger.info('Database and Redis connections established');

      const port = config.port;
      
      this.app.listen({ port }, () => {
        logger.info(`🚀 Search API server is running on port ${port}`);
        logger.info(`📖 API documentation: http://localhost:${port}`);
        logger.info(`🏥 Health check: http://localhost:${port}/health`);
        logger.info(`🔍 Search users: http://localhost:${port}/api/search/users?q=test`);
        logger.info(`📝 Search notes: http://localhost:${port}/api/search/notes?q=test`);
      });

    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }
}

export default App;