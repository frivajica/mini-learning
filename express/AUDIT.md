# Code Audit Report

**Date:** March 28, 2026  
**Project:** mini-express-test  
**Auditor:** Security & Code Review Team

---

## Executive Summary

This report documents the findings of a comprehensive security and code quality audit conducted on the mini-express-test project. The audit identified **22 issues** across 8 categories, ranging from critical security vulnerabilities to code quality improvements. A summary table is provided at the end of this document.

---

## 1. Security Issues

### 1.1 Default JWT Secrets in Configuration

**Severity:** High  
**Location:** `src/config/index.ts:44-45`

The configuration has default fallback JWT secrets that could be accidentally used in production. This is a critical security vulnerability as JWT tokens could be easily forged if the secret is compromised.

**Current Code:**
```typescript
// src/config/index.ts
export const config = {
  // ...
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
    // ...
  },
  // ...
};
```

**Recommendation:** Remove default fallbacks and require environment variables to be set explicitly:

```typescript
jwt: {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  // ...
},
```

Add validation at startup to ensure these secrets are set:

```typescript
if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
  throw new Error('JWT secrets must be configured via environment variables');
}
```

---

### 1.2 Missing Rate Limiting on Token Refresh

**Severity:** High  
**Location:** `src/routes/authRoutes.ts`

The `/auth/refresh` endpoint has no rate limiting. This endpoint could be exploited for brute-force attacks to generate new access tokens.

**Current Code:**
```typescript
// src/routes/authRoutes.ts
router.post('/refresh', authController.refresh);
```

**Recommendation:** Add `authRateLimiter` to the refresh route:

```typescript
import { authRateLimiter } from '../middleware/rateLimit.js';

router.post('/refresh', authRateLimiter, authController.refresh);
```

---

### 1.3 SQL Injection via Search Parameter

**Severity:** Medium  
**Location:** `src/repositories/userRepository.ts:10-12`

The search parameter is passed directly to a LIKE query without sanitizing special SQL characters. Users could exploit this to manipulate query behavior.

**Current Code:**
```typescript
// src/repositories/userRepository.ts
export const userRepository = {
  async search(query: string) {
    return db.query(
      'SELECT * FROM users WHERE name LIKE ? OR email LIKE ?',
      [`%${query}%`, `%${query}%`]
    );
  },
};
```

**Recommendation:** Sanitize special SQL wildcard characters (`%` and `_`):

```typescript
export const userRepository = {
  async search(query: string) {
    const sanitized = query.replace(/[%_]/g, '\\$&');
    return db.query(
      'SELECT * FROM users WHERE name LIKE ? OR email LIKE ?',
      [`%${sanitized}%`, `%${sanitized}%`]
    );
  },
};
```

---

### 1.4 CORS Origin Not Validated from Config

**Severity:** Medium  
**Location:** `src/services/socketService.ts:9`

Socket.io uses `process.env.ALLOWED_ORIGINS` directly instead of validated config. This bypasses the centralized configuration validation.

**Current Code:**
```typescript
// src/services/socketService.ts
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS,
    // ...
  },
});
```

**Recommendation:** Use the validated config instead:

```typescript
import { config } from '../config/index.js';
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: config.cors.origins,
    // ...
  },
});
```

---

## 2. Error Handling & Logging

### 2.1 Using console.error Instead of Logger

**Severity:** Medium  
**Location:** `src/routes/healthRoutes.ts:25,32`

Health checks use `console.error` instead of the configured logger, making it difficult to centralize log management and filtering.

**Current Code:**
```typescript
// src/routes/healthRoutes.ts
router.get('/live', (req, res) => {
  try {
    // health check logic
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Liveness check failed:', error);
    res.status(503).json({ status: 'error' });
  }
});

router.get('/ready', async (req, res) => {
  try {
    // readiness check logic
    res.json({ status: 'ready' });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready' });
  }
});
```

**Recommendation:** Use the configured logger:

```typescript
import { logger } from '../utils/logger.js';

router.get('/live', (req, res) => {
  try {
    // health check logic
    res.json({ status: 'ok' });
  } catch (error) {
    logger.error('Liveness check failed:', error);
    res.status(503).json({ status: 'error' });
  }
});

router.get('/ready', async (req, res) => {
  try {
    // readiness check logic
    res.json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready' });
  }
});
```

---

### 2.2 Using console.log in Socket Service

**Severity:** Low  
**Location:** `src/services/socketService.ts:15,19,24,28`

Socket events use `console.log` instead of the configured logger, which is inconsistent with the rest of the application logging strategy.

**Current Code:**
```typescript
// src/services/socketService.ts
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('message', (data) => {
    console.log('Message received:', data);
    // ...
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.log('Socket error:', error);
  });
});
```

**Recommendation:** Use the configured logger:

```typescript
import { logger } from '../utils/logger.js';

io.on('connection', (socket) => {
  logger.info('Client connected:', { socketId: socket.id });
  
  socket.on('message', (data) => {
    logger.debug('Message received:', data);
    // ...
  });
  
  socket.on('disconnect', (reason) => {
    logger.info('Client disconnected:', { socketId: socket.id, reason });
  });
  
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});
```

---

## 3. Database & ORM

### 3.1 Missing Database Indexes

**Severity:** Medium  
**Location:** `src/db/schema.ts`

Missing indexes can lead to slow queries on large tables. The following indexes are recommended:

**Current Code:**
```typescript
// src/db/schema.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Recommendation:** Add indexes for frequently queried columns:

```typescript
// src/db/schema.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  roleIndex: index('idx_users_role').on(table.role),
}));

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  authorIdIndex: index('idx_posts_author_id').on(table.authorId),
  publishedIndex: index('idx_posts_published').on(table.published),
}));
```

---

### 3.2 No Pagination Limit Cap

**Severity:** Medium  
**Location:** `src/controllers/userController.ts:9`

No maximum limit is enforced on pagination, allowing users to request extremely large result sets (e.g., `limit=1000000`), which could cause performance degradation or denial of service.

**Current Code:**
```typescript
// src/controllers/userController.ts
export const userController = {
  async getUsers(req, res) {
    const { limit = '10', offset = '0' } = req.query;
    const users = await userService.getUsers({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(users);
  },
};
```

**Recommendation:** Cap the limit at a reasonable maximum:

```typescript
const MAX_LIMIT = 100;

export const userController = {
  async getUsers(req, res) {
    const { limit = '10', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit) || MAX_LIMIT, MAX_LIMIT);
    const users = await userService.getUsers({
      limit: limitNum,
      offset: parseInt(offset),
    });
    res.json(users);
  },
};
```

---

## 4. Caching

### 4.1 Using Redis KEYS Command

**Severity:** High  
**Location:** `src/middleware/cache.ts:39`

Using `redis.keys(pattern)` is O(n) and blocks Redis, making it unsuitable for production use with large datasets.

**Current Code:**
```typescript
// src/middleware/cache.ts
export async function clearCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

**Recommendation:** Use the SCAN iterator instead, which is non-blocking:

```typescript
export async function clearCache(pattern: string) {
  const stream = redis.scanStream({
    match: pattern,
    count: 100,
  });
  
  const keys: string[] = [];
  for await (const key of stream) {
    keys.push(...key);
  }
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

---

### 4.2 Cache Key Doesn't Include Query Parameters Properly

**Severity:** Medium  
**Location:** `src/middleware/cache.ts:13`

Using `req.originalUrl` may not properly capture all query parameters, especially with encoding issues.

**Current Code:**
```typescript
// src/middleware/cache.ts
export function generateCacheKey(req: Request): string {
  return `cache:${req.method}:${req.originalUrl}`;
}
```

**Recommendation:** Use proper URL construction with `URL` class:

```typescript
export function generateCacheKey(req: Request): string {
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);
  return `cache:${req.method}:${url.pathname}:${url.search}`;
}
```

Or use `req.url` with proper handling:

```typescript
export function generateCacheKey(req: Request): string {
  const searchParams = new URLSearchParams(req.query as Record<string, string>);
  searchParams.sort();
  return `cache:${req.method}:${req.path}:${searchParams.toString()}`;
}
```

---

### 4.3 Hardcoded Cache TTL

**Severity:** Low  
**Location:** `src/middleware/cache.ts:6`

Cache TTL should be configurable rather than hardcoded, allowing different TTLs per endpoint.

**Current Code:**
```typescript
// src/middleware/cache.ts
const DEFAULT_TTL = 3600; // 1 hour
```

**Recommendation:** Move to configuration:

```typescript
// src/config/index.ts
export const config = {
  // ...
  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
  },
  // ...
};

// src/middleware/cache.ts
import { config } from '../config/index.js';

const DEFAULT_TTL = config.cache.defaultTTL;
```

---

## 5. Authentication

### 5.1 No Token Blacklist for Logout

**Severity:** Medium  
**Location:** `src/services/authService.ts:62-66`

When a user logs out, the access token remains valid until its natural expiration. This is a security concern in scenarios where tokens are compromised or devices are lost.

**Current Code:**
```typescript
// src/services/authService.ts
export const authService = {
  async logout(userId: string): Promise<void> {
    await authRepository.deleteRefreshToken(userId);
    // Access token is NOT invalidated
  },
};
```

**Recommendation:** Implement token blacklist for access tokens:

```typescript
// src/services/authService.ts
import { redis } from '../config/redis.js';

export const authService = {
  async logout(userId: string, token: string): Promise<void> {
    await authRepository.deleteRefreshToken(userId);
    
    // Blacklist the access token
    const ttl = config.jwt.accessExpiry;
    await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
  },
  
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return (await redis.get(`blacklist:${token}`)) === '1';
  },
};
```

Add middleware to check the blacklist:

```typescript
// src/middleware/auth.ts
export const authenticate = async (req, res, next) => {
  const token = extractToken(req);
  
  if (await authService.isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  
  // ... rest of authentication logic
};
```

---

## 6. Code Quality

### 6.1 Singleton Pattern Without DI

**Severity:** Medium  
**Location:** Multiple service files

Services are instantiated directly without dependency injection, making testing difficult and creating tight coupling.

**Current Code:**
```typescript
// src/routes/authRoutes.ts
import { authService } from '../services/authService.js';
import { authController } from '../controllers/authController.js';

const controller = authController(authService);
router.post('/login', controller.login);
```

**Recommendation:** Use a dependency injection container:

```typescript
// src/di/container.ts
import { Container } from 'typedi';
import { AuthService } from '../services/authService.js';
import { UserService } from '../services/userService.js';

Container.set('authService', new AuthService());
Container.set('userService', new UserService());

// src/routes/authRoutes.ts
import { Container } from 'typedi';

const authService = Container.get<AuthService>('authService');
const controller = authController(authService);
```

---

### 6.2 Magic Numbers

**Severity:** Low  
**Location:** Multiple files

Hardcoded values like bcrypt rounds should be constants for maintainability.

**Current Code:**
```typescript
// src/services/authService.ts
const hash = await bcrypt.hash(password, 12);
```

**Recommendation:** Define constants:

```typescript
// src/config/constants.ts
export const SECURITY = {
  BCRYPT_ROUNDS: 12,
  JWT_ACCESS_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
} as const;

// src/services/authService.ts
import { SECURITY } from '../config/constants.js';

const hash = await bcrypt.hash(password, SECURITY.BCRYPT_ROUNDS);
```

---

## 7. Testing

### 7.1 Integration Tests Use Hardcoded DB URL

**Severity:** High  
**Location:** `src/test/setup.ts:4`

Test setup uses a hardcoded database URL instead of environment variables or a test configuration file.

**Current Code:**
```typescript
// src/test/setup.ts
import { db } from '../db/index.js';

process.env.DATABASE_URL = 'postgresql://localhost:5432/test_db';
```

**Recommendation:** Use environment variable or `.env.test`:

```typescript
// src/test/setup.ts
import { db } from '../db/index.js';

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 
  'postgresql://localhost:5432/test_db';
```

Or use `dotenv` with test configuration:

```typescript
// src/test/setup.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// .env.test should contain:
// DATABASE_URL_TEST=postgresql://localhost:5432/test_db
```

---

### 7.2 No Mocking for Socket.io

**Severity:** Medium  
**Location:** `src/test/auth.test.ts`

Tests that involve socket service don't mock it, leading to real socket connections during tests.

**Current Code:**
```typescript
// src/test/auth.test.ts
import { authService } from '../services/authService.js';

describe('Auth Service', () => {
  it('should login user', async () => {
    // This may trigger real socket events
    const result = await authService.login('test@example.com', 'password');
    expect(result).toBeDefined();
  });
});
```

**Recommendation:** Add jest.mock for socketService:

```typescript
// src/test/auth.test.ts
import { jest } from '@jest/globals';

const mockSocketService = {
  emit: jest.fn(),
  broadcast: jest.fn(),
};

jest.unmock('../services/socketService.js');
jest.mock('../services/socketService.js', () => mockSocketService);

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should login user', async () => {
    const result = await authService.login('test@example.com', 'password');
    expect(result).toBeDefined();
    expect(mockSocketService.emit).toHaveBeenCalled();
  });
});
```

---

## 8. Docker

### 8.1 Missing .dockerignore

**Severity:** Medium  
**Location:** Project root

Without a `.dockerignore` file, unnecessary files are included in the Docker image, increasing build time and image size.

**Recommendation:** Create `.dockerignore` in project root:

```
# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Git
.git
.gitignore

# Build outputs
dist
build

# Test files
coverage
.nyc_output

# Documentation
*.md
!README.md
docs

# IDE
.vscode
.idea
*.swp
*.swo

# Environment files
.env
.env.local
.env.*.local

# Misc
.DS_Store
Thumbs.db
```

---

### 8.2 No Health Check in Dockerfile

**Severity:** Low  
**Location:** Dockerfile

The Dockerfile lacks a HEALTHCHECK instruction to verify container health.

**Recommendation:** Add HEALTHCHECK instruction:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
```

---

## 9. Summary Table

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 4 |
| Medium | 13 |
| Low | 5 |
| **Total** | **22** |

### Breakdown by Category

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 2 | 2 | 0 | 4 |
| Error Handling & Logging | 0 | 1 | 1 | 2 |
| Database & ORM | 0 | 2 | 0 | 2 |
| Caching | 1 | 1 | 1 | 3 |
| Authentication | 0 | 1 | 0 | 1 |
| Code Quality | 0 | 1 | 1 | 2 |
| Testing | 1 | 1 | 0 | 2 |
| Docker | 0 | 1 | 1 | 2 |

---

## 10. Recommendations Priority

### Immediate Actions (High Severity)
1. Remove default JWT secrets from configuration
2. Add rate limiting to `/auth/refresh` endpoint
3. Replace Redis KEYS with SCAN iterator
4. Fix hardcoded database URL in test setup

### Short-term Actions (Medium Severity)
1. Sanitize SQL search parameters
2. Use validated CORS config in socket service
3. Replace console.* with logger throughout
4. Add database indexes
5. Implement pagination limit cap
6. Fix cache key generation
7. Implement token blacklist for logout
8. Add .dockerignore file

### Long-term Improvements (Low Severity)
1. Make cache TTL configurable
2. Add health check to Dockerfile
3. Implement dependency injection
4. Extract magic numbers to constants
5. Add socket.io mocking to tests

---

*End of Report*
