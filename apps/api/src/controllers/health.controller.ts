import { Context } from 'hono';
import { prisma, healthCheck } from '@repo/db';
import { cache } from '@repo/db/redis';
import { successResponse } from '@utils/response';

export class HealthController {
  async health(c: Context) {
    try {
      const dbHealth = await healthCheck();
      
      // Check Redis health
      let redisHealth = 'unhealthy';
      try {
        await cache.set('health:check', { timestamp: new Date() }, { ttl: 10 });
        const result = await cache.get('health:check');
        redisHealth = result ? 'healthy' : 'unhealthy';
      } catch (error) {
        redisHealth = 'unhealthy';
      }

      const overallHealth = dbHealth.status === 'healthy' && redisHealth === 'healthy' ? 'healthy' : 'unhealthy';

      return c.json(successResponse({
        status: overallHealth,
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth,
          redis: { status: redisHealth },
        },
      }));
    } catch (error) {
      return c.json({
        success: false,
        error: {
          message: 'Health check failed',
          code: 'HEALTH_CHECK_ERROR',
        },
      }, 503);
    }
  }

  async ready(c: Context) {
    try {
      // Check if database is accessible
      const userCount = await prisma.user.count();
      const noteCount = await prisma.note.count();
      
      // Check if Redis is accessible
      await cache.set('ready:check', { timestamp: new Date() }, { ttl: 10 });

      return c.json(successResponse({
        status: 'ready',
        timestamp: new Date().toISOString(),
        stats: {
          users: userCount,
          notes: noteCount,
        },
      }));
    } catch (error) {
      return c.json({
        success: false,
        error: {
          message: 'Service not ready',
          code: 'NOT_READY',
        },
      }, 503);
    }
  }
}

export const healthController = new HealthController();