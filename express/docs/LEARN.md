# Learning Guide

This file guides you through the project to understand each concept in practice. Each section includes file references and explanations.

---

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Clean Architecture](#2-clean-architecture)
3. [Configuration Management](#3-configuration-management)
4. [Database & Drizzle ORM](#4-database--drizzle-orm)
5. [Caching with Redis](#5-caching-with-redis)
6. [Authentication & JWT](#6-authentication--jwt)
7. [Middleware Patterns](#7-middleware-patterns)
8. [Error Handling](#8-error-handling)
9. [Validation with Zod](#9-validation-with-zod)
10. [WebSockets](#10-websockets)
11. [API Documentation](#11-api-documentation)
12. [Security Best Practices](#12-security-best-practices)
13. [Testing](#12-testing)
14. [Docker Setup](#13-docker-setup)
15. [Production Considerations](#14-production-considerations)
16. [Dependency Injection](#16-dependency-injection)
17. [Critical Audit Findings](#17-critical-audit-findings--security-lessons)
18. [Dependency Injection - Pros & Cons](#18-dependency-injection---pros--cons)

---

## 1. Project Structure

### Files to Review
- [src/app.ts](../src/app.ts) - Main Express application setup
- [src/server.ts](../src/server.ts) - Entry point with graceful shutdown

### Key Concepts
```
src/
├── config/           # Configuration (env, database, redis)
├── controllers/      # HTTP layer (thin - req/res only)
├── services/        # Business logic (thick)
├── repositories/    # Data access layer
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── types/           # TypeScript interfaces
├── utils/           # Helpers, error classes
├── db/             # Database schema & connection
├── app.ts          # Express setup
└── server.ts       # Entry point
```

**Why this structure?**
- Separation of concerns: Each layer has a single responsibility
- Testability: Each layer can be tested independently
- Scalability: Easy to add new features without touching other layers

### Learning Point
Look at `src/server.ts:17-35` to see how all pieces come together and how graceful shutdown works.

---

## 2. Clean Architecture

### Files to Review
- [src/controllers/userController.ts](../src/controllers/userController.ts) - Thin controller
- [src/services/userService.ts](../src/services/userService.ts) - Business logic
- [src/repositories/userRepository.ts](../src/repositories/userRepository.ts) - Data access

### Key Concepts

**Controller** - Handles HTTP only:
```typescript
// src/controllers/userController.ts:12-18
getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await userService.getAll({ page, limit, search });
  res.status(200).json(result);
});
```

**Service** - Business logic:
```typescript
// src/services/userService.ts:12-25
async getAll(options) {
  const result = await userRepository.findAll({ page, limit, search });
  return {
    data: result.data,
    meta: { total: result.total, page, limit, totalPages: ... },
  };
}
```

**Repository** - Database queries:
```typescript
// src/repositories/userRepository.ts:8-18
async findAll(options) {
  const where = search ? like(users.name, `%${search}%`) : undefined;
  const [data, total] = await Promise.all([
    db.select().from(users).where(where).limit(limit).offset(offsetVal),
    db.select({ count: sql`count(*)` }).from(users).where(where),
  ]);
  return { data, total: total[0]?.count || 0 };
}
```

### Learning Point
Follow a request through the entire flow: `routes/userRoutes.ts` → `controllers/userController.ts` → `services/userService.ts` → `repositories/userRepository.ts`

---

## 3. Configuration Management

### Files to Review
- [src/config/index.ts](../src/config/index.ts) - Configuration with Zod validation
- [.env.example](../.env.example) - Environment variables template

### Key Concepts
- All config validated at startup using Zod
- Type-safe configuration
- No hardcoded values

```typescript
// src/config/index.ts:5-15
const configSchema = z.object({
  port: z.number().default(3000),
  database: z.object({ url: z.string().url() }),
  redis: z.object({ url: z.string().url() }),
  jwt: z.object({ secret: z.string().min(32), ... }),
  ...
});
```

### Learning Point
Check `src/config/index.ts:42-55` to see how environment variables are parsed and validated.

---

## 4. Database & Drizzle ORM

### Files to Review
- [src/db/schema.ts](../src/db/schema.ts) - Database schema
- [src/db/index.ts](../src/db/index.ts) - Database connection
- [src/repositories/userRepository.ts](../src/repositories/userRepository.ts) - Query examples

### Key Concepts

**Schema Definition:**
```typescript
// src/db/schema.ts:3-18
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('USER'),
  ...
});
```

**Type-Safe Queries:**
```typescript
// src/repositories/userRepository.ts:8-18
const [data, total] = await Promise.all([
  db.select().from(users).where(eq(users.id, id)),
  db.select({ count: sql`count(*)` }).from(users),
]);
```

### Why Drizzle?
- Lightweight (~100KB vs Prisma's ~5MB)
- SQL-like syntax (easier to optimize)
- Zero dependencies
- Full TypeScript support

---

## 5. Caching with Redis

### Files to Review
- [src/middleware/cache.ts](../src/middleware/cache.ts) - Cache middleware
- [src/config/redis.ts](../src/config/redis.ts) - Redis connection

### Key Concepts

**Cache-Aside Pattern:**
```typescript
// src/middleware/cache.ts:8-30
export const cache = (options) => {
  return async (req, res, next) => {
    const cacheKey = `${prefix}:${req.originalUrl}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cached));
    }
    
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redis.setex(cacheKey, ttl, JSON.stringify(data));
      return originalJson(data);
    };
    
    next();
  };
};
```

### Learning Point
See `src/routes/userRoutes.ts:24` to see how caching is applied to GET endpoints.

---

## 6. Authentication & JWT

### Files to Review
- [src/middleware/auth.ts](../src/middleware/auth.ts) - Auth middleware
- [src/services/authService.ts](../src/services/authService.ts) - Auth logic
- [src/routes/authRoutes.ts](../src/routes/authRoutes.ts) - Auth routes

### Key Concepts

**JWT Structure:**
- Access Token: 15 minutes, for API requests
- Refresh Token: 7 days, for getting new access tokens

```typescript
// src/services/authService.ts:54-68
private async generateTokens(payload) {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn, // 15m
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn, // 7d
  });

  await authRepository.createRefreshToken(payload.userId, refreshToken, expiresAt);
  
  return { accessToken, refreshToken };
}
```

**Auth Middleware:**
```typescript
// src/middleware/auth.ts:8-25
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, config.jwt.secret);
  req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
  next();
};
```

### Learning Point
Check `src/routes/userRoutes.ts:21` to see how `authenticate` protects routes and `authorize` restricts by role.

### Alternative: Passport

This project uses **manual middleware** for JWT auth (in `src/middleware/auth.ts`). However, you could use **Passport** instead.

**What is Passport?** The standard authentication framework for Node.js with pluggable "strategies":

```typescript
// Passport strategies are like adapters
passport.use(new JwtStrategy(options, verifyFn));
passport.use(new LocalStrategy(options, verifyFn));
passport.use(new GoogleStrategy(options, verifyFn));
```

**Without Passport (current implementation):** You manually:
- Extract token from header
- Verify JWT signature
- Check expiration
- Attach user to request

**With Passport:** Does all the above automatically, then calls your `verify` callback.

---

## 7. Middleware Patterns

### Files to Review
- [src/middleware/errorHandler.ts](../src/middleware/errorHandler.ts) - Global error handling
- [src/middleware/rateLimit.ts](../src/middleware/rateLimit.ts) - Rate limiting
- [src/middleware/validate.ts](../src/middleware/validate.ts) - Validation
- [src/middleware/requestId.ts](../src/middleware/requestId.ts) - Request tracking

### Key Concepts

**Error Handler (IMPORTANT - Detailed Example):**
```typescript
// src/middleware/errorHandler.ts:9-50
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const requestId = (req as any).id || 'unknown';

  // Handle operational errors (our custom errors)
  if (err instanceof AppError) {
    const response = {
      message: err.message,
      statusCode: err.statusCode,
      status: err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error',
    };

    // Include validation errors if present
    if (err instanceof ValidationError && (err as any).errors) {
      response.errors = (err as any).errors;
    }

    // Log operational errors (warn level)
    logger.warn({ err, requestId, path: req.path }, 'Operational error');

    return res.status(err.statusCode).json(response);
  }

  // Handle unexpected errors (500)
  logger.error({ err, requestId, path: req.path }, 'Unhandled error');

  const response = {
    message: config.nodeEnv === 'production' 
      ? 'Internal server error' 
      : err.message,
    statusCode: 500,
    status: 'error',
  };

  // Include stack trace only in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};
```

**Why this error handler is detailed:**
1. **Operational vs Programming errors**: Distinguishes between expected errors (4xx) and unexpected (5xx)
2. **Request tracking**: Uses request ID to trace errors
3. **Security**: Hides internal errors in production
4. **Validation errors**: Special handling for Zod validation errors
5. **Logging levels**: Uses warn for operational, error for unexpected

### Learning Point
This is the most important middleware for production. Study it carefully!

---

## 8. Validation with Zod

### Files to Review
- [src/middleware/validate.ts](../src/middleware/validate.ts) - Validation middleware
- [src/routes/authRoutes.ts](../src/routes/authRoutes.ts) - Usage examples

### Key Concepts

**Schema Definition:**
```typescript
// src/routes/authRoutes.ts:8-14
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});
```

**Middleware Usage:**
```typescript
// src/routes/authRoutes.ts:18
router.post('/register', 
  authRateLimiter,
  validate(registerSchema),
  authController.register
);
```

### Learning Point
See `src/middleware/validate.ts:10-28` to understand how Zod validation errors are transformed into standardized API errors.

---

## 9. WebSockets

### Files to Review
- [src/services/socketService.ts](../src/services/socketService.ts) - Socket.io setup
- [src/services/userService.ts](../src/services/userService.ts) - Emitting events

### Key Concepts

**Initialization:**
```typescript
// src/services/socketService.ts:10-25
export function initializeSocket(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
  });

  io.on('connection', (socket) => {
    socket.on('join:room', (room) => socket.join(room));
    socket.on('disconnect', () => console.log('Client disconnected'));
  });

  return io;
}
```

**Emitting Events:**
```typescript
// src/services/userService.ts:33-35
io?.emit('user:created', { id: user.id, email: user.email, name: user.name });
```

### Learning Point
Check `src/server.ts:24` to see how Socket.io is initialized with the HTTP server.

---

## 10. API Documentation

### Files to Review
- [src/config/swagger.ts](../src/config/swagger.ts) - Swagger configuration
- [src/app.ts](../src/app.ts) - Swagger middleware

### Key Concepts

```typescript
// src/config/swagger.ts:10-30
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Express Production API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};
```

### Learning Point
Access `http://localhost:3000/api-docs` to see the interactive API documentation.

---

## 11. Security Best Practices

### Files to Review
- [src/app.ts](../src/app.ts) - Security middleware
- [src/middleware/rateLimit.ts](../src/middleware/rateLimit.ts) - Rate limiting

### Key Concepts

```typescript
// src/app.ts:8-16
app.use(helmet());           // Security headers
app.use(cors({ origin: config.cors.origins })); // CORS
app.use(compression());      // Response compression
app.use(globalRateLimiter);  // Rate limiting
```

### Security Headers (Helmet)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## 12. Testing

### Files to Review
- [src/test/userService.test.ts](../src/test/userService.test.ts) - Unit tests
- [src/test/auth.test.ts](../src/test/auth.test.ts) - Integration tests

### Key Concepts

**Unit Test Example:**
```typescript
// src/test/userService.test.ts:30-40
it('should return paginated users', async () => {
  mockUserRepository.findAll.mockResolvedValue({ data: mockUsers, total: 2 });
  const result = await userService.getAll({ page: 1, limit: 10 });
  expect(result.data).toHaveLength(2);
  expect(result.meta.total).toBe(2);
});
```

**Integration Test Example:**
```typescript
// src/test/auth.test.ts:30-40
it('should register a new user', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: 'test@example.com', name: 'Test', password: 'password123' });
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('accessToken');
});
```

---

## 13. Docker Setup

### Files to Review
- [docker-compose.yml](../docker-compose.yml) - Multi-container setup
- [Dockerfile](../Dockerfile) - Application container

### Key Concepts

**Services:**
- `app` - Node.js application
- `postgres` - PostgreSQL database
- `redis` - Redis cache

**Health Checks:**
```yaml
# docker-compose.yml:30-35
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

### Learning Point
Run `docker-compose up -d` to start all services. Check `docker-compose.yml` for how services are connected.

---

## 14. Production Considerations

### Files to Review
- [src/server.ts](../src/server.ts) - Graceful shutdown

### Key Concepts

```typescript
// src/server.ts:27-43
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down...`);

  server.close(async () => {
    await disconnectRedis();
    await db.$client.end();
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Why This Matters
- Allows in-flight requests to complete
- Properly closes database/Redis connections
- Prevents data corruption

---

## Summary

### Start Learning Here

1. **Start with**: `src/server.ts` - Entry point
2. **Then**: `src/app.ts` - How Express is configured
3. **Then**: `src/routes/userRoutes.ts` - How routes are structured
4. **Then**: Follow a request through controller → service → repository

### Key Files by Topic

| Topic | Files |
|-------|-------|
| Architecture | `app.ts`, `controllers`, `services`, `repositories` |
| Database | `db/schema.ts`, `db/index.ts`, `repositories` |
| Auth | `services/authService.ts`, `middleware/auth.ts` |
| Caching | `middleware/cache.ts`, `config/redis.ts` |
| Error Handling | `middleware/errorHandler.ts` |
| Validation | `middleware/validate.ts`, `routes/*Routes.ts` |
| WebSockets | `services/socketService.ts` |
| Testing | `test/*.test.ts` |

---

## Interview Questions

### High Priority
1. Explain the clean architecture layers in this project
2. How does the cache-aside pattern work?
3. JWT vs Sessions - pros/cons
4. How would you handle 100k concurrent connections?
5. Database indexing strategies

### Medium Priority
1. Why use refresh tokens?
2. How does rate limiting work?
3. Error handling best practices
4. Docker networking between services

### Lower Priority
1. Swagger vs other documentation tools
2. Testing strategies (unit vs integration)
3. Logging levels and structured logging

---

## Next Steps

1. Run the project with Docker
2. Make small changes and see how they propagate
3. Add a new endpoint following the same patterns
4. Write tests for new features
5. Deploy to a cloud provider (Vercel, Railway, etc.)

---

## 16. Dependency Injection

> **Frontend Analogy**: Think of DI like React props - you don't create your child components inside a parent, you receive them. DI does the same for backend services.

### Files to Review
- [src/di/container.ts](../src/di/container.ts) - DI container (wires all dependencies)
- [src/types/interfaces/repositories.ts](../src/types/interfaces/repositories.ts) - Repository interfaces
- [src/types/interfaces/services.ts](../src/types/interfaces/services.ts) - Service interfaces
- [src/services/userService.ts](../src/services/userService.ts) - Constructor injection example
- [src/controllers/userController.ts](../src/controllers/userController.ts) - Controller injection example

### What is Dependency Injection?

Instead of creating dependencies yourself, the framework **injects** them for you.

**Without DI (you create everything):**
```typescript
// Everything created manually - hard to test, tightly coupled
const db = new Database();
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo);
const controller = new UserController(userService);
```

**With DI (someone gives it to you):**
```typescript
// Just declare what you need, get it injected
constructor(private userService: UserService) {}
```

### Why Does It Matter?

| Benefit | Explanation |
|---------|-------------|
| **Testability** | Easy to swap real DB with mock |
| **Single Responsibility** | Services don't create their dependencies |
| **Loose Coupling** | Classes don't know how to create their dependencies |
| **Flexibility** | Easy to swap implementations |

### How Express DI Works (Manual)

Since Express doesn't have built-in DI, we create a **container** that wires everything:

**1. Define Interfaces (contracts):**
```typescript
// src/types/interfaces/repositories.ts
export interface IUserRepository {
  findAll(options: { page: number; limit: number; search?: string }): Promise<{ data: User[]; total: number }>;
  findById(id: number): Promise<User | null>;
  create(data: NewUser): Promise<User>;
}
```

**2. Class Implements Interface:**
```typescript
// src/repositories/userRepository.ts
export class UserRepository implements IUserRepository {
  async findAll(options) { /* ... */ }
  async findById(id) { /* ... */ }
}
```

**3. Constructor Injection (declare what you need):**
```typescript
// src/services/userService.ts
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getAll(options) {
    return await this.userRepository.findAll(options);
  }
}
```

**4. DI Container (wire everything together):**
```typescript
// src/di/container.ts
const dbConnection = new Database();
const userRepository = new UserRepository(dbConnection);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export { userController, userService, userRepository };
```

**5. Using in Routes:**
```typescript
// src/routes/userRoutes.ts
const userController = createUserController();
router.get('/', userController.getAll);
```

### Scope Decision for Real Apps

**Why Singletons?**
- **Repositories**: Hold database connection pools (expensive to create per request)
- **Services**: Stateless, can safely reuse single instance
- **Controllers**: Created fresh per request (to get fresh instances)

```typescript
// src/di/container.ts
// Singletons - one instance for entire app lifetime
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

// Factory - creates new instance per request
export const createUserController = () => new UserController(userService);
```

### Learning Point
This pattern enables:
- Easy unit testing (inject mocks)
- Swapping implementations (e.g., different database)
- Clear dependency graph (see container.ts)

---

## 17. Critical Audit Findings & Security Lessons

This section documents the most important issues found during the code audit and explains why they matter.

### 16.1 JWT Secret Validation in Production

**File:** `src/config/index.ts`

**Why It's Dangerous:**
```typescript
// BEFORE - DANGER: Default secrets could be accidentally used in production
secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
```

If this default secret is accidentally deployed to production, attackers can:
1. Forge JWT tokens
2. Impersonate any user including admins
3. Access all protected resources

**The Fix:**
```typescript
// AFTER - Validates secrets in production
function validateProductionSecrets(jwt, nodeEnv) {
  if (nodeEnv === 'production') {
    if (jwt.secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
  }
}
```

**Lesson:** Never have fallback secrets. Fail fast in production.

---

### 16.2 Redis KEYS Command - Production Killer

**File:** `src/middleware/cache.ts`

**Why It's Dangerous:**
```typescript
// BEFORE - DANGER: KEYS blocks Redis for seconds/minutes
const keys = await redis.keys(pattern);
```

Using `KEYS` in production:
1. Scans ALL keys in Redis (O(n))
2. Blocks Redis entirely during scan
3. Can cause timeouts across your entire application
4. Attackers can exploit this for DoS

**The Fix:**
```typescript
// AFTER - Uses SCAN iterator (non-blocking)
const stream = redis.scanStream({ match: pattern, count: 100 });
```

**Lesson:** Never use KEYS, FLUSHDB, or similar commands in production. Always use iterators.

---

### 16.3 SQL Injection via Search

**File:** `src/repositories/userRepository.ts`

**Why It's Dangerous:**
```typescript
// BEFORE - DANGER: Unsanitized input
const where = search ? like(users.name, `%${search}%`) : undefined;
```

If user searches for `%`, it matches ALL names. Attackers can:
1. Extract all data using `%` wildcards
2. Use `_` to match single characters
3. Bypass application logic

**The Fix:**
```typescript
// AFTER - Sanitizes special SQL characters
function sanitizeSearchInput(search: string): string {
  return search.replace(/[%_]/g, '\\$&');
}
```

**Lesson:** Always escape user input in database queries, even with ORMs.

---

### 16.4 Missing Rate Limiting on Token Refresh

**File:** `src/routes/authRoutes.ts`

**Why It's Dangerous:**
- No rate limiting on `/auth/refresh`
- Attackers can brute-force refresh tokens
- Could lead to token theft or DoS

**The Fix:**
```typescript
router.post('/refresh',
  authRateLimiter, // Added
  validate(refreshSchema),
  authController.refresh
);
```

**Lesson:** Every public endpoint needs rate limiting, especially auth endpoints.

---

### 16.5 Cache Key Ignores Query Parameters

**File:** `src/middleware/cache.ts`

**Why It's Dangerous:**
```typescript
// BEFORE - Different queries return same cached data
const cacheKey = `${prefix}:${req.originalUrl}`;
```

- `/users?page=1` and `/users?page=2` would return same data
- Breaks pagination completely
- Users see incorrect data

**The Fix:**
```typescript
// AFTER - Includes all query parameters
const queryString = req.query ? Object.keys(req.query).sort()
  .map(key => `${key}=${req.query[key]}`)
  .join('&') : '';
const cacheKey = `${prefix}:${req.path}${queryString ? '?' + queryString : ''}`;
```

**Lesson:** Cache keys must include all parameters that affect the response.

---

### 16.6 No Pagination Limit Cap

**File:** `src/controllers/userController.ts`

**Why It's Dangerous:**
```typescript
// BEFORE - Users can request millions of records
const limit = parseInt(req.query.limit as string) || 10;
```

Can cause:
1. Memory exhaustion (loading millions of rows)
2. Database connection starvation
3. Application crashes

**The Fix:**
```typescript
// AFTER - Caps limit at configured maximum
const limit = Math.min(
  Math.max(1, parseInt(req.query.limit as string) || config.pagination.defaultLimit),
  config.pagination.maxLimit
);
```

**Lesson:** Always validate and cap user-controlled pagination.

---

### 16.7 Using Console Instead of Logger

**Files:** `src/routes/healthRoutes.ts`, `src/services/socketService.ts`

**Why It's Dangerous:**
- No structured logging
- Can't filter by severity
- Can't track in production monitoring
- Loses context in containerized environments

**The Fix:** Use pino logger throughout:
```typescript
import { logger } from '../utils/logger.js';
logger.info({ socketId: socket.id }, 'Client connected');
```

**Lesson:** Never use console.log/console.error in production code.

---

### 16.8 Summary: What to Remember

| Issue | Impact | Prevention |
|-------|--------|------------|
| Default secrets | Account takeover | Fail fast in production |
| Redis KEYS | Application downtime | Use SCAN iterator |
| Unsanitized search | Data breach | Escape user input |
| No rate limiting | Brute force attacks | Apply to all endpoints |
| Broken cache keys | Data corruption | Include all params |
| Unlimited pagination | DoS/crash | Cap with config |
| Console vs Logger | No observability | Use structured logger |

---

## 18. Dependency Injection - Pros & Cons

### What is Dependency Injection?

Instead of creating dependencies inside a class:
```typescript
// Without DI - tightly coupled
class UserService {
  private repo = new UserRepository(); // Creates its own dependency
}
```

We inject them from outside:
```typescript
// With DI - loosely coupled
class UserService {
  constructor(private userRepository: UserRepository) {} // Injected
}
```

---

### Pros of Dependency Injection

| Benefit | Description |
|---------|-------------|
| **Testability** | Easy to mock dependencies in tests |
| **Flexibility** | Swap implementations (e.g., different databases) |
| **Single Responsibility** | Class doesn't know how to create its dependencies |
| **Reusability** | Same service works in different contexts |
| **Easier Refactoring** | Change one dependency doesn't break others |

---

### Cons of Dependency Injection

| Drawback | Description |
|----------|-------------|
| **Complexity** | More code to write initially |
| **Learning Curve** | Requires understanding of DI patterns |
| **Over-Engineering** | May be overkill for small projects |
| **Runtime Overhead** | Slight performance cost (negligible) |

---

### When to Use DI

**Use DI when:**
- Building large applications
- Need comprehensive testing
- Multiple implementations of same interface
- Team collaboration on shared code

**Skip DI when:**
- Simple scripts or prototypes
- Single-person projects
- Very tight time constraints

---

### Implementation Options in Node.js/TypeScript

1. **Manual DI** (what we use):
   ```typescript
   class Service {
     constructor(private repo: Repository) {}
   }
   ```

2. **DI Container** (e.g., tsyringe, inversify):
   ```typescript
   @injectable()
   class UserService {
     @inject('UserRepository')
     private userRepository: UserRepository;
   }
   ```

3. **Factory Functions**:
   ```typescript
   const createUserService = (repo) => new UserService(repo);
   ```

For this project, we use **manual DI** because:
- Simple to understand
- No additional dependencies
- Works well with singleton pattern
- Sufficient for most use cases

---

## Interview Quick Reference

When asked about these audit findings, emphasize:

1. **"I know what's dangerous in production"** - KEYS, default secrets, no rate limits
2. **"I think about security at every layer"** - Input sanitization, validation, limits
3. **"I use proper observability"** - Structured logging, not console
4. **"I test edge cases"** - Pagination limits, cache invalidation, search special chars
