import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { userService } from '../services/userService.js';
import { userRepository } from '../repositories/userRepository.js';
import { NotFoundError, ConflictError } from '../utils/AppError.js';

jest.mock('../repositories/userRepository.ts');
jest.mock('../middleware/cache.ts', () => ({
  invalidateCache: jest.fn().mockResolvedValue(undefined),
}));

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, email: 'test1@example.com', name: 'Test 1', password: 'hash', role: 'USER', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, email: 'test2@example.com', name: 'Test 2', password: 'hash', role: 'USER', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUserRepository.findAll.mockResolvedValue({
        data: mockUsers,
        total: 2,
      });

      const result = await userService.getAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hash',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getById(1);

      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        email: 'new@example.com',
        name: 'New User',
        password: 'hashed_password',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userService.create({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      });

      expect(result.email).toBe('new@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw ConflictError if email exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
        name: 'Existing',
        password: 'hash',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(userService.create({
        email: 'existing@example.com',
        name: 'New User',
        password: 'password123',
      })).rejects.toThrow(ConflictError);
    });
  });
});
