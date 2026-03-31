import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', async (_req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = true;
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
  }

  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    logger.error({ err: error }, 'Redis health check failed');
  }

  const allReady = checks.database && checks.redis;

  res.status(allReady ? 200 : 503).json({
    status: allReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export default router;
