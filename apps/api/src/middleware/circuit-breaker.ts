import * as opossum from 'opossum';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { AppError } from '@/utils/errors';

export interface CircuitBreakerOptions {
  timeout: number; // Time to wait before considering a call as failed (ms)
  errorThreshold: number; // Number of failures before opening circuit
  resetTimeout: number; // Time to wait before trying again (ms)
  monitoringPeriod?: number; // Time window for monitoring (ms)
}

export interface CircuitBreakerStats {
  state: string;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  nextAttempt?: number;
}

export class WrappedCircuitBreaker {
  private circuitBreaker: CircuitBreaker;
  private failureCount: number = 0;
  private successCount: number = 0;
  private readonly options: CircuitBreakerOptions;

  constructor(name: string, options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      timeout: env.CIRCUIT_BREAKER_TIMEOUT,
      errorThreshold: env.CIRCUIT_BREAKER_ERROR_THRESHOLD,
      resetTimeout: env.CIRCUIT_BREAKER_RESET_TIMEOUT,
      monitoringPeriod: 60000, // 1 minute
      ...options,
    };

    this.circuitBreaker = new opossum.default(options, this.options);
    
    // Set up event listeners
    this.circuitBreaker.on('open', () => {
      logger.warn({
        name,
        message: 'Circuit breaker opened',
      });
    });

    this.circuitBreaker.on('halfOpen', () => {
      logger.info({
        name,
        message: 'Circuit breaker half-open',
      });
    });

    this.circuitBreaker.on('close', () => {
      logger.info({
        name,
        message: 'Circuit breaker closed',
      });
    });

    this.circuitBreaker.on('fallback', (data) => {
      logger.warn({
        name,
        data,
        message: 'Circuit breaker fallback triggered',
      });
    });
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await this.circuitBreaker.fire(fn);
      this.successCount++;
      return result;
    } catch (error) {
      this.failureCount++;
      
      // Check if it's a circuit breaker error
      if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
        throw new AppError(
          'Service temporarily unavailable',
          'SERVICE_UNAVAILABLE',
          503
        );
      }
      
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      logger.debug({
        state: this.circuitBreaker.state,
        duration,
        message: 'Circuit breaker operation completed',
      });
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.circuitBreaker.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: undefined, // opossum doesn't expose this
      lastSuccessTime: undefined, // opossum doesn't expose this
      nextAttempt: undefined, // opossum doesn't expose this
    };
  }

  /**
   * Force the circuit breaker to a specific state (for testing)
   */
  setState(state: string): void {
    // opossum doesn't support direct state setting
    // This would need to be implemented differently if needed
    logger.warn({
      state,
      message: 'Manual circuit breaker state setting not supported with opossum',
    });
  }
}

/**
 * Circuit breaker registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers: Map<string, WrappedCircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  /**
   * Get or create a circuit breaker for a given service
   */
  getCircuitBreaker(name: string, options?: Partial<CircuitBreakerOptions>): WrappedCircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new WrappedCircuitBreaker(name, options));
    }
    return this.circuitBreakers.get(name)!;
  }

  /**
   * Get statistics for all circuit breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    for (const [name, circuitBreaker] of this.circuitBreakers) {
      stats[name] = circuitBreaker.getStats();
    }
    
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.setState('CLOSED');
    }
    
    logger.info({
      message: 'All circuit breakers reset',
    });
  }
}

export const circuitBreakerRegistry = CircuitBreakerRegistry.getInstance();

/**
 * Predefined circuit breakers for different services
 */
export const crawlerCircuitBreaker = circuitBreakerRegistry.getCircuitBreaker('crawler', {
  timeout: 30000, // 30 seconds
  errorThreshold: 3, // Open after 3 failures
  resetTimeout: 120000, // Wait 2 minutes before retrying
});

export const databaseCircuitBreaker = circuitBreakerRegistry.getCircuitBreaker('database', {
  timeout: 10000, // 10 seconds
  errorThreshold: 5, // Open after 5 failures
  resetTimeout: 60000, // Wait 1 minute before retrying
});

export const redisCircuitBreaker = circuitBreakerRegistry.getCircuitBreaker('redis', {
  timeout: 5000, // 5 seconds
  errorThreshold: 5, // Open after 5 failures
  resetTimeout: 30000, // Wait 30 seconds before retrying
});

/**
 * Higher-order function to wrap any async function with circuit breaker
 */
export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  circuitBreaker: WrappedCircuitBreaker
): T {
  return (async (...args: Parameters<T>) => {
    return circuitBreaker.execute(() => fn(...args));
  }) as T;
}