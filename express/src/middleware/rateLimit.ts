import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { AuthRequest } from '../types/index.js';

export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later' },
  skipSuccessfulRequests: false,
});

declare module 'express-rate-limit' {
  interface Request {
    rateLimit: {
      limit: number;
      remaining: number;
      reset: number;
    };
  }
}

export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 60000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const userId = (req as AuthRequest).user?.id;
      return userId ? `ratelimit:user:${userId}` : `ratelimit:ip:${req.ip}`;
    },
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    message: { message: 'Rate limit exceeded' },
  });
};
