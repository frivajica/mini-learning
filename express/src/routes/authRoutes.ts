import { Router } from 'express';
import { createAuthController } from '../di/container.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();
const authController = createAuthController();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

router.post('/register', 
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post('/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/refresh',
  authRateLimiter,
  validate(refreshSchema),
  authController.refresh
);

router.post('/logout',
  authRateLimiter,
  authController.logout
);

export default router;
