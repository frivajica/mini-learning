import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.log.level,
  transport: config.nodeEnv === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child(context);
}
