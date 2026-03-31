import { Router } from 'express';
import { createUserController } from '../di/container.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, validateParams, validateQuery } from '../middleware/validate.js';
import { cache } from '../middleware/cache.js';
import { config } from '../config/index.js';
import { z } from 'zod';

const router = Router();
const userController = createUserController();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
});

const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
});

router.use(authenticate);

router.get('/', 
  cache({ ttl: config.cache.defaultTtl, prefix: 'cache:api' }),
  validateQuery(paginationSchema),
  userController.getAll
);

router.get('/:id',
  validateParams(idParamSchema),
  userController.getById
);

router.post('/',
  authorize('ADMIN'),
  validate(createUserSchema),
  userController.create
);

router.put('/:id',
  validateParams(idParamSchema),
  validate(updateUserSchema),
  userController.update
);

router.delete('/:id',
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.delete
);

export default router;
