import { Context, Next } from 'hono';
import { customMetrics } from '@/config/telemetry';
import { logger } from '@/config/logger';

export function metricsMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    
    // Extract route pattern (remove dynamic parts)
    const route = path.replace(/\/[a-f0-9-]{36}/g, '/:id')
                     .replace(/\/\d+/g, '/:number');
    
    try {
      await next();
      
      const statusCode = c.res.status;
      const duration = Date.now() - startTime;
      
      // Record metrics
      customMetrics.httpRequestsTotal(method, route, statusCode);
      customMetrics.httpRequestDuration(method, route, statusCode, duration);
      
      // Log slow requests
      if (duration > 1000) {
        logger.warn({
          method,
          route,
          statusCode,
          duration,
          userAgent: c.req.header('user-agent'),
          message: 'Slow request detected',
        });
      }
    } catch (error) {
      const statusCode = 500;
      const duration = Date.now() - startTime;
      
      // Record error metrics
      customMetrics.httpRequestsTotal(method, route, statusCode);
      customMetrics.httpRequestDuration(method, route, statusCode, duration);
      
      throw error;
    }
  };
}