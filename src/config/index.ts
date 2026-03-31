import { z } from 'zod';

const jwtSchema = z.object({
  secret: z.string().min(32),
  refreshSecret: z.string().min(32),
  expiresIn: z.string().default('15m'),
  refreshExpiresIn: z.string().default('7d'),
});

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  
  database: z.object({
    url: z.string().url(),
  }),
  
  redis: z.object({
    url: z.string().url(),
  }),
  
  jwt: jwtSchema,
  
  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000']),
  }),
  
  rateLimit: z.object({
    windowMs: z.number().default(15 * 60 * 1000),
    max: z.number().default(100),
    authMax: z.number().default(10),
  }),
  
  pagination: z.object({
    defaultLimit: z.number().default(10),
    maxLimit: z.number().default(100),
  }),
  
  cache: z.object({
    defaultTtl: z.number().default(300),
  }),
  
  bcrypt: z.object({
    rounds: z.number().default(12),
  }),
  
  log: z.object({
    level: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  }),
});

export type Config = z.infer<typeof configSchema>;

function validateProductionSecrets(jwt: Config['jwt'], nodeEnv: string) {
  if (nodeEnv === 'production') {
    const defaultSecret = 'default-secret-change-in-production';
    const defaultRefresh = 'default-refresh-secret-change';
    
    if (jwt.secret === defaultSecret || jwt.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    if (jwt.refreshSecret === defaultRefresh || jwt.refreshSecret.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
  }
}

function loadConfig(): Config {
  const jwtConfig = {
    secret: process.env.JWT_SECRET || 'dev-secret-min-32-chars-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-min-32-chars-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };

  const nodeEnv = process.env.NODE_ENV || 'development';
  
  try {
    validateProductionSecrets(jwtConfig, nodeEnv);
  } catch (error) {
    console.error('Configuration validation failed:', (error as Error).message);
    process.exit(1);
  }

  const parsed = configSchema.safeParse({
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv,
    database: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/express_app',
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    jwt: jwtConfig,
    cors: {
      origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10'),
    },
    pagination: {
      defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '10'),
      maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100'),
    },
    cache: {
      defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    },
    log: {
      level: (process.env.LOG_LEVEL || 'info') as Config['log']['level'],
    },
  });

  if (!parsed.success) {
    console.error('Invalid configuration:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const config = loadConfig();
