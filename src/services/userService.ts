import bcrypt from 'bcrypt';
import { IUserRepository } from '../types/interfaces/repositories.js';
import { IUserService } from '../types/interfaces/services.js';
import { User } from '../db/schema.js';
import { NotFoundError, ConflictError } from '../utils/AppError.js';
import { invalidateCache } from '../middleware/cache.js';
import { io } from '../services/socketService.js';
import { config } from '../config/index.js';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const result = await this.userRepository.findAll({ page, limit, search });
    
    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async create(data: { email: string; name: string; password: string; role?: string }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.rounds);
    
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'USER',
    });

    io?.emit('user:created', { id: user.id, email: user.email, name: user.name });

    return this.sanitizeUser(user);
  }

  async update(id: number, data: { name?: string; email?: string; role?: string }) {
    const user = await this.userRepository.update(id, data);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    io?.emit('user:updated', { id: user.id, ...data });

    return this.sanitizeUser(user);
  }

  async delete(id: number) {
    const user = await this.userRepository.delete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await invalidateCache('cache:api*');

    io?.emit('user:deleted', { id });

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
