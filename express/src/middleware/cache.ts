import { Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AuthRequest } from '../types/index.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const cache = (options: { ttl?: number; prefix?: string } = {}) => {
  const { ttl = config.cache.defaultTtl, prefix = 'cache' } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const queryString = req.query ? Object.keys(req.query).sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(req.query[key]))}`)
      .join('&') : '';
    const cacheKey = `${prefix}:${req.path}${queryString ? '?' + queryString : ''}`;

    try {
      const cached = await redis.get(cacheKey);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        try {
          return res.status(200).json(JSON.parse(cached));
        } catch {
          logger.warn({ cacheKey }, 'Failed to parse cached data');
          next();
          return;
        }
      }

      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = (data: unknown) => {
        redis.setex(cacheKey, ttl, JSON.stringify(data)).catch((err) => {
          logger.error({ err }, 'Cache set error');
        });
        return originalJson(data);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const keys: string[] = [];
    const stream = redis.scanStream({ match: pattern, count: 100 });

    stream.on('data', (batch: string[]) => {
      keys.push(...batch);
    });

    stream.on('end', async () => {
      try {
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    stream.on('error', (error: Error) => {
      reject(error);
    });
  });
};
