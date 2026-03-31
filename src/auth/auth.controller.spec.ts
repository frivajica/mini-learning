import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({
      user: { id: 1, email: 'test@example.com', name: 'Test', role: 'USER' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
    login: jest.fn().mockResolvedValue({
      user: { id: 1, email: 'test@example.com', name: 'Test', role: 'USER' },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await controller.register({
        email: 'test@example.com',
        name: 'Test',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(service.register).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(service.login).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      const result = await controller.refresh({ refreshToken: 'old-token' });

      expect(result).toHaveProperty('accessToken');
      expect(service.refresh).toHaveBeenCalledWith('old-token');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      await controller.logout({ refreshToken: 'token' });
      expect(service.logout).toHaveBeenCalledWith('token');
    });
  });
});
