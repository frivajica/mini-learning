import { db } from '../db/index.js';
import { refreshTokens } from '../db/schema.js';
import { eq, gt } from 'drizzle-orm';
import { IAuthRepository } from '../types/interfaces/repositories.js';

export class AuthRepository implements IAuthRepository {
  async createRefreshToken(userId: number, token: string, expiresAt: Date) {
    const result = await db
      .insert(refreshTokens)
      .values({ userId, token, expiresAt })
      .returning();
    return result[0];
  }

  async findRefreshToken(token: string) {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
    return result[0] || null;
  }

  async deleteRefreshToken(token: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async cleanExpiredTokens() {
    await db.delete(refreshTokens).where(
      gt(refreshTokens.expiresAt, new Date())
    );
  }
}
