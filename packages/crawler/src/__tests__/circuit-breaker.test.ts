import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitState } from '../utils/circuit-breaker.js';
import { CircuitBreakerError } from '../types/index.js';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
    });
  });

  it('should start in CLOSED state', () => {
    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should allow successful requests in CLOSED state', async () => {
    const result = await circuitBreaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should open after threshold failures', async () => {
    const failingFn = async () => {
      throw new Error('Failed');
    };

    for (let i = 0; i < 3; i++) {
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow('Failed');
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
  });

  it('should reject requests when OPEN', async () => {
    const failingFn = async () => {
      throw new Error('Failed');
    };

    for (let i = 0; i < 3; i++) {
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow();
    }

    await expect(circuitBreaker.execute(async () => 'test')).rejects.toThrow(CircuitBreakerError);
  });

  it('should transition to HALF_OPEN after reset timeout', async () => {
    const failingFn = async () => {
      throw new Error('Failed');
    };

    for (let i = 0; i < 3; i++) {
      await expect(circuitBreaker.execute(failingFn)).rejects.toThrow();
    }

    expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    await circuitBreaker.execute(async () => 'success');
    expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should reset failure count on success', async () => {
    await expect(circuitBreaker.execute(async () => {
      throw new Error('Failed');
    })).rejects.toThrow();

    await circuitBreaker.execute(async () => 'success');

    const stats = circuitBreaker.getStats();
    expect(stats.failureCount).toBe(0);
  });

  it('should provide accurate stats', async () => {
    await expect(circuitBreaker.execute(async () => {
      throw new Error('Failed');
    })).rejects.toThrow();

    const stats = circuitBreaker.getStats();
    expect(stats.state).toBe(CircuitState.CLOSED);
    expect(stats.failureCount).toBe(1);
    expect(stats.lastFailureTime).toBeGreaterThan(0);
  });
});
