import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
import type { User } from "./db";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-secret-at-least-32-characters-long!!",
);

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: Using development JWT_SECRET. Set JWT_SECRET in production!",
  );
}

const ACCESS_TOKEN_EXPIRY = "15m";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function createAccessToken(user: User): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function validateUser(
  email: string,
  password: string,
): Promise<User | null> {
  const user = db.users.findByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function getCurrentUser(
  refreshToken?: string,
): Promise<User | null> {
  if (!refreshToken) return null;

  const tokenRecord = db.refreshTokens.findByToken(refreshToken);
  if (!tokenRecord) return null;

  return db.users.findById(tokenRecord.userId) || null;
}
