import Bull, { Job, Queue, QueueOptions } from 'bull';
import { redis } from '@/data-access/redis';
import { logger } from '@/config/logger';
import { env } from '@/config/env';

export interface QueueJobData {
  type: string;
  payload: any;
  attempts?: number;
  priority?: number;
  delay?: number;
  timestamp: number;
}

export interface QueueJobResult {
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Queue> = new Map();

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Get or create a queue
   */
  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queueOptions: QueueOptions = {
        redis: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD,
          db: env.REDIS_DB,
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50, // Keep last 50 failed jobs
          attempts: 3, // Default retry attempts
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
        settings: {
          stalledInterval: 30 * 1000, // 30 seconds
          maxStalledCount: 1,
        },
      };

      const queue = new Bull(name, queueOptions);
      
      // Set up event listeners
      queue.on('error', (error) => {
        logger.error({
          queue: name,
          error: error.message,
          message: 'Queue error',
        });
      });

      queue.on('waiting', (jobId) => {
        logger.debug({
          queue: name,
          jobId,
          message: 'Job waiting',
        });
      });

      queue.on('active', (job) => {
        logger.debug({
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          message: 'Job started',
        });
      });

      queue.on('completed', (job, result) => {
        logger.info({
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          duration: Date.now() - job.timestamp,
          message: 'Job completed',
        });
      });

      queue.on('failed', (job, error) => {
        logger.error({
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          error: error.message,
          attempts: job.attemptsMade,
          message: 'Job failed',
        });
      });

      queue.on('stalled', (job) => {
        logger.warn({
          queue: name,
          jobId: job.id,
          jobType: job.data.type,
          message: 'Job stalled',
        });
      });

      this.queues.set(name, queue);
    }
    
    return this.queues.get(name)!;
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    queueName: string,
    jobData: QueueJobData
  ): Promise<Job<QueueJobData>> {
    const queue = this.getQueue(queueName);
    
    const job = await queue.add(jobData.type, jobData, {
      attempts: jobData.attempts || 3,
      priority: jobData.priority,
      delay: jobData.delay,
    });

    logger.debug({
      queue: queueName,
      jobId: job.id,
      jobType: jobData.type,
      message: 'Job added to queue',
    });

    return job;
  }

  /**
   * Process jobs in the queue
   */
  async processJobs(
    queueName: string,
    processor: (job: Job<QueueJobData>) => Promise<QueueJobResult>,
    concurrency: number = 1
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    
    queue.process(concurrency, async (job) => {
      const startTime = Date.now();
      
      try {
        logger.debug({
          queue: queueName,
          jobId: job.id,
          jobType: job.data.type,
          message: 'Processing job',
        });

        const result = await processor(job);
        const duration = Date.now() - startTime;

        logger.info({
          queue: queueName,
          jobId: job.id,
          jobType: job.data.type,
          success: result.success,
          duration,
          message: 'Job processing completed',
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error({
          queue: queueName,
          jobId: job.id,
          jobType: job.data.type,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
          message: 'Job processing failed',
        });

        throw error;
      }
    });

    logger.info({
      queue: queueName,
      concurrency,
      message: 'Job processor started',
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const queue = this.getQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: await queue.isPaused(),
    };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
    
    logger.info({
      queue: queueName,
      message: 'Queue paused',
    });
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
    
    logger.info({
      queue: queueName,
      message: 'Queue resumed',
    });
  }

  /**
   * Clean up queue (remove completed/failed jobs)
   */
  async cleanQueue(
    queueName: string,
    grace: number = 0,
    limit: number = 100,
    type: 'completed' | 'failed' = 'completed'
  ): Promise<number> {
    const queue = this.getQueue(queueName);
    const deletedJobs = await queue.clean(grace, type, limit);
    
    logger.info({
      queue: queueName,
      type,
      deletedJobs,
      message: 'Queue cleaned',
    });

    return deletedJobs.length;
  }

  /**
   * Gracefully shutdown all queues
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.queues.values()).map(async (queue) => {
      try {
        await queue.close();
        logger.info({
          queue: queue.name,
          message: 'Queue closed',
        });
      } catch (error) {
        logger.error({
          queue: queue.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Error closing queue',
        });
      }
    });

    await Promise.all(shutdownPromises);
    this.queues.clear();
    
    logger.info({
      message: 'All queues shutdown',
    });
  }
}

export const queueService = QueueService.getInstance();

/**
 * Predefined queue names
 */
export const QUEUES = {
  CACHE_REFRESH: env.BACKGROUND_REFRESH_QUEUE_NAME,
  CRAWLER_JOBS: 'crawler-jobs',
  NOTIFICATIONS: 'notifications',
  CLEANUP: 'cleanup',
} as const;