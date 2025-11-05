import pino from 'pino';
import { config } from './env';

const loggerConfig: pino.LoggerOptions = {
  level: config.logging.level,
  ...(config.env === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
};

export const logger = pino(loggerConfig);

export type Logger = pino.Logger;