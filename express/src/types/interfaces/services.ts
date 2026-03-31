import { User } from '../../db/schema.js';

export interface IUserService {
  getAll(options: { page: number; limit: number; search?: string }): Promise<{
    data: Omit<User, 'password'>[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  getById(id: number): Promise<Omit<User, 'password'>>;
  create(data: { email: string; name: string; password: string; role?: string }): Promise<Omit<User, 'password'>>;
  update(id: number, data: { name?: string; email?: string; role?: string }): Promise<Omit<User, 'password'>>;
  delete(id: number): Promise<Omit<User, 'password'>>;
}

export interface IAuthService {
  register(data: { email: string; name: string; password: string }): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }>;
  login(data: { email: string; password: string }): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }>;
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(refreshToken?: string): Promise<void>;
}
