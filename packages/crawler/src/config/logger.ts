import pino from 'pino';
import { getEnv } from './env.js';

let logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (logger) {
    return logger;
  }

  const env = getEnv();

  logger = pino({
    level: env.NODE_ENV === 'test' ? 'silent' : 'info',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'HH:MM:ss',
            },
          }
        : undefined,
  });

  return logger;
}

export function resetLogger(): void {
  logger = null;
}
