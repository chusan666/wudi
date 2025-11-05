import { logger } from './logger';
import { env } from './env';

export function initializeTelemetry(): void {
  logger.info({
    serviceName: env.OTEL_SERVICE_NAME,
    serviceVersion: env.OTEL_SERVICE_VERSION,
    environment: env.NODE_ENV,
    message: 'Telemetry initialized (simplified version)',
  });
}

export async function shutdownTelemetry(): Promise<void> {
  logger.info({
    message: 'Telemetry shutdown completed',
  });
}

/**
 * Get custom metrics for application-specific monitoring
 */
export interface CustomMetrics {
  httpRequestsTotal: (method: string, route: string, statusCode: number) => void;
  httpRequestDuration: (method: string, route: string, statusCode: number, duration: number) => void;
  cacheHitsTotal: (key: string, hit: boolean) => void;
  circuitBreakerStateChanges: (service: string, fromState: string, toState: string) => void;
  databaseQueryDuration: (operation: string, table: string, duration: number) => void;
  crawlerRequestsTotal: (platform: string, success: boolean) => void;
}

// Simplified metrics implementation that logs
export const customMetrics: CustomMetrics = {
  httpRequestsTotal: (method: string, route: string, statusCode: number) => {
    logger.debug({
      method,
      route,
      statusCode,
      type: 'metric',
      metric: 'http_requests_total',
    });
  },
  
  httpRequestDuration: (method: string, route: string, statusCode: number, duration: number) => {
    logger.debug({
      method,
      route,
      statusCode,
      duration,
      type: 'metric',
      metric: 'http_request_duration_seconds',
    });
  },
  
  cacheHitsTotal: (key: string, hit: boolean) => {
    logger.debug({
      key,
      hit,
      type: 'metric',
      metric: 'cache_hits_total',
    });
  },
  
  circuitBreakerStateChanges: (service: string, fromState: string, toState: string) => {
    logger.info({
      service,
      fromState,
      toState,
      type: 'metric',
      metric: 'circuit_breaker_state_changes_total',
    });
  },
  
  databaseQueryDuration: (operation: string, table: string, duration: number) => {
    logger.debug({
      operation,
      table,
      duration,
      type: 'metric',
      metric: 'database_query_duration_seconds',
    });
  },
  
  crawlerRequestsTotal: (platform: string, success: boolean) => {
    logger.debug({
      platform,
      success,
      type: 'metric',
      metric: 'crawler_requests_total',
    });
  },
};