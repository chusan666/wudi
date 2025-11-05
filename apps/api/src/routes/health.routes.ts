import { Hono } from 'hono';
import { successResponse } from '@utils/response';
import { prisma } from '@data-access/prisma';
import { redisClient } from '@data-access/redis';

const healthRoutes = new Hono();

// Basic health check
healthRoutes.get('/', async (c) => {
  return c.json(successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));
});

// Detailed health check
healthRoutes.get('/detailed', async (c) => {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    crawler: 'unknown',
    memory: 'unknown',
  };

  // Database health check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
  }

  // Redis health check
  try {
    await redisClient.get('health:check');
    checks.redis = 'healthy';
  } catch (error) {
    checks.redis = 'unhealthy';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
    total: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
  };

  const isHealthy = Object.values(checks).every(status => 
    typeof status === 'string' ? status === 'healthy' : true
  );

  return c.json(successResponse({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }), isHealthy ? 200 : 503);
});

export default healthRoutes;