import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestScheduler } from '../scheduler/request-scheduler.js';

describe('RequestScheduler', () => {
  let scheduler: RequestScheduler;

  beforeEach(() => {
    scheduler = new RequestScheduler({
      concurrency: 2,
      rateLimitMaxRequests: 10,
      rateLimitWindowMs: 1000,
      retryMaxAttempts: 1,
    });
  });

  it('should schedule and execute task', async () => {
    const task = {
      id: 'test-1',
      fn: async () => 'result',
      createdAt: new Date(),
    };

    const result = await scheduler.schedule(task);
    expect(result).toBe('result');
  });

  it('should respect concurrency limit', async () => {
    let activeTasks = 0;
    let maxActiveTasks = 0;

    const tasks = Array.from({ length: 5 }, (_, i) => ({
      id: `task-${i}`,
      fn: async () => {
        activeTasks++;
        maxActiveTasks = Math.max(maxActiveTasks, activeTasks);
        await new Promise((resolve) => setTimeout(resolve, 100));
        activeTasks--;
        return i;
      },
      createdAt: new Date(),
    }));

    await Promise.all(tasks.map((task) => scheduler.schedule(task)));

    expect(maxActiveTasks).toBeLessThanOrEqual(2);
  });

  it('should handle task failures', async () => {
    const task = {
      id: 'failing-task',
      fn: async () => {
        throw new Error('Task failed');
      },
      createdAt: new Date(),
    };

    await expect(scheduler.schedule(task)).rejects.toThrow('Task failed');

    const stats = scheduler.getStats();
    expect(stats.failed).toBeGreaterThan(0);
  });

  it('should track stats correctly', async () => {
    const task1 = {
      id: 'task-1',
      fn: async () => 'success',
      createdAt: new Date(),
    };

    const task2 = {
      id: 'task-2',
      fn: async () => {
        throw new Error('Failed');
      },
      createdAt: new Date(),
    };

    await scheduler.schedule(task1);
    await expect(scheduler.schedule(task2)).rejects.toThrow();

    const stats = scheduler.getStats();
    expect(stats.completed).toBe(1);
    expect(stats.failed).toBe(1);
  });

  it('should emit metrics events', async () => {
    const metricsEvents: any[] = [];
    scheduler.on('metrics', (metrics) => {
      metricsEvents.push(metrics);
    });

    const task = {
      id: 'test-task',
      fn: async () => 'result',
      createdAt: new Date(),
    };

    await scheduler.schedule(task);

    expect(metricsEvents.length).toBeGreaterThan(0);
    expect(metricsEvents.some((e) => e.event === 'success')).toBe(true);
  });

  it('should clear queue', async () => {
    scheduler.clear();
    const stats = scheduler.getStats();

    expect(stats.queued).toBe(0);
    expect(stats.active).toBe(0);
  });
});
