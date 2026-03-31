import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export type Role = 'USER' | 'ADMIN';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}
