import pino from 'pino';
import { getEnv } from './env.js';

let logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (logger) {
    return logger;
  }

  const env = getEnv();

  logger = pino({
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });

  return logger;
}

export function resetLogger(): void {
  logger = null;
}
