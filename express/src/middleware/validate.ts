import { Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AuthRequest } from '../types/index.js';
import { ValidationError } from '../utils/AppError.js';

export const validate = (schema: ZodSchema) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        
        const validationError = new ValidationError('Validation failed');
        validationError.errors = errors;
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new ValidationError('Invalid parameters');
        const fieldErrors = error.flatten().fieldErrors;
        validationError.errors = Object.fromEntries(
          Object.entries(fieldErrors).filter(([, v]) => v !== undefined)
        ) as Record<string, string[]>;
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new ValidationError('Invalid query parameters');
        const fieldErrors = error.flatten().fieldErrors;
        validationError.errors = Object.fromEntries(
          Object.entries(fieldErrors).filter(([, v]) => v !== undefined)
        ) as Record<string, string[]>;
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};
