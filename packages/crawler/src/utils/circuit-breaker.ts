import { CircuitBreakerError } from '../types/index.js';
import { getLogger } from '../config/logger.js';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxAttempts?: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private halfOpenAttempts = 0;
  private readonly logger = getLogger();

  constructor(private readonly options: CircuitBreakerOptions) {
    this.options.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? 3;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.logger.info('Circuit breaker transitioning to HALF_OPEN');
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
      } else {
        throw new CircuitBreakerError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.info('Circuit breaker closing after successful half-open attempt');
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= (this.options.halfOpenMaxAttempts ?? 3)) {
        this.logger.warn('Circuit breaker opening after failed half-open attempts');
        this.state = CircuitState.OPEN;
      }
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.options.failureThreshold) {
        this.logger.warn(`Circuit breaker opening after ${this.failureCount} failures`);
        this.state = CircuitState.OPEN;
      }
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return false;
    }
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): { state: CircuitState; failureCount: number; lastFailureTime: number | null } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }
}
