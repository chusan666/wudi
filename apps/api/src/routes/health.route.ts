import { Hono } from 'hono';
import { healthCheck as dbHealthCheck } from '@repo/db';
import { cache } from '@repo/db/redis';
import { successResponse } from '@/utils/response.js';

const healthRoute = new Hono();

healthRoute.get('/', async (c) => {
  const dbHealth = await dbHealthCheck();
  
  let redisHealth = { healthy: false };
  try {
    await cache.set('health:check', { timestamp: Date.now() }, { ttl: 60 });
    const check = await cache.get('health:check');
    redisHealth = { healthy: !!check };
  } catch (error) {
    redisHealth = { healthy: false, error: String(error) };
  }

  const isHealthy = dbHealth.healthy && redisHealth.healthy;

  return successResponse(
    c,
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbHealth,
      redis: redisHealth,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 200 : 503
  );
});

export default healthRoute;
