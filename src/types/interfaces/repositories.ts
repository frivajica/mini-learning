import { User, NewUser, Post, NewPost } from '../../db/schema.js';

export interface IUserRepository {
  findAll(options: { page: number; limit: number; search?: string }): Promise<{
    data: User[];
    total: number;
  }>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: string): Promise<User[]>;
  create(data: NewUser): Promise<User>;
  update(id: number, data: Partial<NewUser>): Promise<User | null>;
  delete(id: number): Promise<User | null>;
  count(): Promise<number>;
}

export interface IAuthRepository {
  createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<unknown>;
  findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
  cleanExpiredTokens(): Promise<void>;
}

export interface IPostRepository {
  findAll(options: { page: number; limit: number }): Promise<{
    data: Post[];
    total: number;
  }>;
  findById(id: number): Promise<Post | null>;
  findByAuthorId(authorId: number): Promise<Post[]>;
  create(data: NewPost): Promise<Post>;
  update(id: number, data: Partial<NewPost>): Promise<Post | null>;
  delete(id: number): Promise<Post | null>;
}
