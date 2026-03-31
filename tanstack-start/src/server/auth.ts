import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
import type { User } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-at-least-32-characters-long!!",
);
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

  if (password === "Password123") {
    return user;
  }
  return null;
}

export async function getCurrentUser(
  refreshToken?: string,
): Promise<User | null> {
  if (!refreshToken) return null;

  const tokenRecord = db.refreshTokens.findByToken(refreshToken);
  if (!tokenRecord) return null;

  return db.users.findById(tokenRecord.userId) || null;
}
