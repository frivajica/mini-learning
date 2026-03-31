import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';
import { IAuthRepository } from '../types/interfaces/repositories.js';
import { IUserRepository } from '../types/interfaces/repositories.js';
import { IAuthService } from '../types/interfaces/services.js';
import { User } from '../db/schema.js';
import { UnauthorizedError, ConflictError } from '../utils/AppError.js';
import { TokenPayload } from '../types/index.js';

export class AuthService implements IAuthService {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}
  async register(data: { email: string; name: string; password: string }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.rounds);
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    await this.authRepository.deleteRefreshToken(refreshToken);

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return tokens;
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.authRepository.deleteRefreshToken(refreshToken);
    }
  }

  private async generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });

    const expiresAt = new Date();
    const refreshDays = parseInt(config.jwt.refreshExpiresIn.replace(/\D/g, '')) || 7;
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.authRepository.createRefreshToken(payload.userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
