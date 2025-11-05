import { checkPrismaHealth, closePrismaConnection } from '@/data-access/prisma';
import { checkRedisHealth, closeRedisConnection } from '@/data-access/redis';
import { circuitBreakerRegistry } from '@/middleware/circuit-breaker';
import { queueService } from './queue.service';
import { logger } from '@/config/logger';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    queues: {
      status: 'healthy' | 'unhealthy';
      queues: Record<string, {
        status: 'healthy' | 'unhealthy';
        waiting: number;
        active: number;
        failed: number;
      }>;
    };
    circuitBreakers: {
      status: 'healthy' | 'unhealthy';
      breakers: Record<string, {
        state: string;
        failureCount: number;
      }>;
    };
  };
  memory: {
    used: string;
    total: string;
    percentage: number;
  };
  uptime: number;
}

export class HealthService {
  private static instance: HealthService;
  private startTime: number = Date.now();

  static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    // Check all services in parallel
    const [dbHealth, redisHealth, queueStats, circuitBreakerStats] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkQueueHealth(),
      this.checkCircuitBreakerHealth(),
    ]);

    const database = dbHealth.status === 'fulfilled' ? dbHealth.value : {
      status: 'unhealthy' as const,
      error: dbHealth.reason?.message || 'Unknown error',
    };

    const redis = redisHealth.status === 'fulfilled' ? redisHealth.value : {
      status: 'unhealthy' as const,
      error: redisHealth.reason?.message || 'Unknown error',
    };

    const queues = queueStats.status === 'fulfilled' ? queueStats.value : {
      status: 'unhealthy' as const,
      queues: {},
      error: queueStats.reason?.message || 'Unknown error',
    };

    const circuitBreakers = circuitBreakerStats.status === 'fulfilled' ? circuitBreakerStats.value : {
      status: 'unhealthy' as const,
      breakers: {},
      error: circuitBreakerStats.reason?.message || 'Unknown error',
    };

    // Determine overall health status
    const overallStatus = this.determineOverallStatus({
      database,
      redis,
      queues,
      circuitBreakers,
    });

    const memory = this.getMemoryUsage();
    const uptime = Date.now() - this.startTime;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
        queues,
        circuitBreakers,
      },
      memory,
      uptime,
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await checkPrismaHealth();
      const responseTime = Date.now() - startTime;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await checkRedisHealth();
      const responseTime = Date.now() - startTime;
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check queue health
   */
  private async checkQueueHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    queues: Record<string, {
      status: 'healthy' | 'unhealthy';
      waiting: number;
      active: number;
      failed: number;
    }>;
  }> {
    try {
      const queueNames = ['cache-refresh', 'crawler-jobs', 'notifications', 'cleanup'];
      const queueChecks = await Promise.allSettled(
        queueNames.map(async (name) => {
          const stats = await queueService.getQueueStats(name);
          const isHealthy = stats.failed < stats.completed * 0.1; // Less than 10% failure rate
          
          return {
            name,
            status: isHealthy ? 'healthy' : 'unhealthy',
            waiting: stats.waiting,
            active: stats.active,
            failed: stats.failed,
          };
        })
      );

      const queues: Record<string, any> = {};
      let overallHealthy = true;

      for (const check of queueChecks) {
        if (check.status === 'fulfilled') {
          queues[check.value.name] = {
            status: check.value.status,
            waiting: check.value.waiting,
            active: check.value.active,
            failed: check.value.failed,
          };
          
          if (check.value.status === 'unhealthy') {
            overallHealthy = false;
          }
        }
      }

      return {
        status: overallHealthy ? 'healthy' : 'unhealthy',
        queues,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queues: {},
      };
    }
  }

  /**
   * Check circuit breaker health
   */
  private async checkCircuitBreakerHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    breakers: Record<string, {
      state: string;
      failureCount: number;
    }>;
  }> {
    try {
      const allStats = circuitBreakerRegistry.getAllStats();
      const breakers: Record<string, any> = {};
      let overallHealthy = true;

      for (const [name, stats] of Object.entries(allStats)) {
        const isHealthy = stats.state !== 'OPEN';
        
        breakers[name] = {
          state: stats.state,
          failureCount: stats.failureCount,
        };
        
        if (!isHealthy) {
          overallHealthy = false;
        }
      }

      return {
        status: overallHealthy ? 'healthy' : 'unhealthy',
        breakers,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        breakers: {},
      };
    }
  }

  /**
   * Determine overall health status
   */
  private determineOverallStatus(services: {
    database: any;
    redis: any;
    queues: any;
    circuitBreakers: any;
  }): 'healthy' | 'unhealthy' | 'degraded' {
    const { database, redis, queues, circuitBreakers } = services;
    
    // If any critical service is unhealthy, mark as unhealthy
    if (database.status === 'unhealthy' || redis.status === 'unhealthy') {
      return 'unhealthy';
    }
    
    // If any service is degraded, mark as degraded
    if (queues.status === 'unhealthy' || circuitBreakers.status === 'unhealthy') {
      return 'degraded';
    }
    
    return 'healthy';
  }

  /**
   * Get memory usage information
   */
  private getMemoryUsage(): {
    used: string;
    total: string;
    percentage: number;
  } {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);
    
    return {
      used: `${usedMB}MB`,
      total: `${totalMB}MB`,
      percentage,
    };
  }

  /**
   * Graceful shutdown of all services
   */
  async shutdown(): Promise<void> {
    logger.info({
      message: 'Starting graceful shutdown of all services',
    });

    const shutdownPromises = [
      this.shutdownQueues(),
      this.shutdownDatabase(),
      this.shutdownRedis(),
    ];

    try {
      await Promise.allSettled(shutdownPromises);
      logger.info({
        message: 'All services shut down gracefully',
      });
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error during graceful shutdown',
      });
    }
  }

  private async shutdownQueues(): Promise<void> {
    try {
      await queueService.shutdown();
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error shutting down queues',
      });
    }
  }

  private async shutdownDatabase(): Promise<void> {
    try {
      await closePrismaConnection();
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error shutting down database',
      });
    }
  }

  private async shutdownRedis(): Promise<void> {
    try {
      await closeRedisConnection();
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error shutting down Redis',
      });
    }
  }
}

export const healthService = HealthService.getInstance();