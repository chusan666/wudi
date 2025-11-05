import { connectDatabase } from '@repo/db';
import { connectRedis } from '@repo/db/redis';
import { getEnv } from '@/config/env.js';
import { getLogger } from '@/config/logger.js';
import { createApp } from '@/app.js';
import { closeCrawler } from '@/data-access/crawler.data-access.js';

async function main() {
  // Initialize environment
  const env = getEnv();
  const logger = getLogger();

  logger.info('🚀 Starting Xiaohongshu API server...');

  // Connect to databases
  await connectDatabase();
  await connectRedis();

  // Create and start server
  const app = createApp();
  const port = parseInt(env.PORT, 10);

  logger.info({ port }, 'Server starting on port');

  const server = Bun.serve({
    port,
    fetch: app.fetch,
  });

  logger.info({
    port: server.port,
    environment: env.NODE_ENV,
  }, '✅ API server is ready');

  logger.info({
    endpoints: {
      health: `http://localhost:${port}/health`,
      notes: `http://localhost:${port}/api/notes/:id`,
      root: `http://localhost:${port}/`,
    }
  }, '📚 Available endpoints');

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('🛑 Shutting down gracefully...');
    await closeCrawler();
    server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('❌ Failed to start API server:', error);
  process.exit(1);
});
