import { z } from 'zod';

const configSchema = z.object({
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/nestjs'),
  
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  JWT_SECRET: z.string().default('dev-secret-change-in-production-min-32-chars'),
  JWT_REFRESH_SECRET: z.string().default('dev-secret-refresh-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  CORS_ORIGINS: z.string().default(''),
  
  BCRYPT_ROUNDS: z.number().default(12),
  
  RATE_LIMIT_TTL: z.number().default(60000),
  RATE_LIMIT_LIMIT: z.number().default(100),
  
  CACHE_DEFAULT_TTL: z.number().default(300),
});

export default () => {
  const env = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS) : undefined,
    RATE_LIMIT_TTL: process.env.RATE_LIMIT_TTL ? parseInt(process.env.RATE_LIMIT_TTL) : undefined,
    RATE_LIMIT_LIMIT: process.env.RATE_LIMIT_LIMIT ? parseInt(process.env.RATE_LIMIT_LIMIT) : undefined,
    CACHE_DEFAULT_TTL: process.env.CACHE_DEFAULT_TTL ? parseInt(process.env.CACHE_DEFAULT_TTL) : undefined,
  };

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
  }

  return configSchema.parse(env);
};
