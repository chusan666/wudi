import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { env } from './env';

const isDevelopment = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDevelopment && !isTest && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  ...(isTest && {
    // In tests, we want to suppress logs
    silent: true,
  }),
});

// Export a no-op logger for tests that might not have initialized the logger
export const createNoOpLogger = () => ({
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
});