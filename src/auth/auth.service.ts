import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../database/database.module';
import { users, refreshTokens, User } from '../database/schema';
import { eq } from 'drizzle-orm';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (existing[0]) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      this.configService.get<number>('BCRYPT_ROUNDS') || 10,
    );

    const result = await this.db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        password: hashedPassword,
      })
      .returning();

    const user = result[0];
    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(data: LoginDto) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    const user = result[0];
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    const storedToken = result[0];
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId));

    const user = userResult[0];
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return tokens;
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
    }
  }

  private async generateTokens(payload: { userId: number; email: string; role: string }) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    } as any);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    } as any);

    const expiresAt = new Date();
    const refreshDays = parseInt(
      (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d').replace(/\D/g, '')
    ) || 7;
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.db
      .insert(refreshTokens)
      .values({
        userId: payload.userId,
        token: refreshToken,
        expiresAt,
      });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
