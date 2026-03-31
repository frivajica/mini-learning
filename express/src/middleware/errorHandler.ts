import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

interface ErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  stack?: string;
  errors?: Record<string, string[]>;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      message: err.message,
      statusCode: err.statusCode,
      status: err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error',
    };

    if (err instanceof ValidationError && err.errors) {
      response.errors = err.errors;
    }

    logger.warn({
      err,
      requestId,
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
    }, 'Operational error');

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error({
    err,
    requestId,
    path: req.path,
    method: req.method,
  }, 'Unhandled error');

  const response: ErrorResponse = {
    message: config.nodeEnv === 'production' 
      ? 'Internal server error' 
      : err.message,
    statusCode: 500,
    status: 'error',
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};
