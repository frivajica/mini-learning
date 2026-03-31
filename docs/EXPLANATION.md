# Express.js - Detailed Explanations

This document provides comprehensive explanations of each topic covered in the project. Use this as a learning resource to understand the "why" behind each implementation.

---

## Table of Contents
1. [Architecture & Code Organization](#1-architecture--code-organization)
2. [Database & ORM](#2-database--orm)
3. [Caching](#3-caching)
4. [API Design & Best Practices](#4-api-design--best-practices)
5. [Security](#5-security)
6. [Performance & Optimization](#6-performance--optimization)
7. [Error Handling](#7-error-handling)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Real-time Communication](#9-real-time-communication)
10. [Validation](#10-validation)
11. [Documentation](#11-documentation)
12. [Testing](#12-testing)
13. [Logging & Observability](#13-logging--observability)
14. [DevOps & Deployment](#14-devops--deployment)
15. [Reliability & Production](#15-reliability--production)

---

## 1. Architecture & Code Organization

### Clean Architecture

Clean Architecture is a software design principle that separates code into distinct layers, each with specific responsibilities. This makes code more testable, maintainable, and scalable.

**Layers in our project:**
- **Controllers** (Presentation Layer): Handle HTTP requests/responses. They should be "thin" - just parsing input and sending output.
- **Services** (Business Logic Layer): Contains all business rules and logic. This is where the "heavy lifting" happens.
- **Repositories** (Data Access Layer): Handles database operations. Acts as a bridge between services and database.

**Why separate layers?**
```
Controller: req → extract data → call service → format response → res
Service:   validate business rules → orchestrate operations
Repository: database queries only
```

This separation means:
- You can change the database without touching business logic
- You can test business logic without HTTP requests
- Multiple services can reuse same repositories

### Dependency Injection

Instead of importing dependencies directly (e.g., `import { PrismaClient } from '@prisma/client'`), we inject them. This makes testing easier and follows SOLID's Dependency Inversion principle.

```typescript
// Bad - tightly coupled
class UserService {
  async getUser(id: string) {
    const prisma = new PrismaClient(); // Direct instantiation
    return prisma.user.findUnique({ where: { id } });
  }
}

// Good - dependency injection
class UserService {
  constructor(private prisma: PrismaClient) {}
  
  async getUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### SOLID Principles

| Principle | Description | Application in Project |
|-----------|-------------|----------------------|
| **S**ingle Responsibility | Each class does one thing | Controllers handle HTTP, Services handle logic |
| **O**pen/Closed | Open for extension, closed for modification | Use interfaces for flexibility |
| **L**iskov Substitution | Subtypes must be substitutable | Can swap implementations (e.g., different caches) |
| **I**nterface Segregation | Many small interfaces > one big | Separate interfaces for different needs |
| **D**ependency Inversion | Depend on abstractions, not concretions | Inject dependencies |

---

## 2. Database & ORM

### Why Prisma?

Prisma is a modern ORM that provides:
- **Type Safety**: Full TypeScript support with generated types
- **Auto-completion**: IDE knows your schema
- **Migration System**: Version control for your database
- **Query Optimization**: Efficient SQL generation

### Database Connection Pooling

When your app has thousands of requests, creating a new database connection for each request is slow. Connection pooling maintains a pool of reusable connections.

```typescript
// Prisma handles connection pooling automatically
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

### The N+1 Problem

The N+1 problem occurs when you fetch a list of items, then make individual queries for each item's related data.

```typescript
// BAD - N+1 problem
const users = await prisma.user.findMany(); // 1 query
for (const user of users) {
  const posts = await prisma.post.findMany({  // N queries!
    where: { authorId: user.id }
  });
}

// GOOD - using include
const users = await prisma.user.findMany({
  include: { posts: true } // Single query with JOIN
});
```

### Migrations

Migrations keep your database schema in sync with your code. Each migration is a versioned change to your schema.

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

---

## 3. Caching

### Why Cache?

Reading from cache (Redis) is ~100x faster than querying a database. Cache frequently accessed data that doesn't change often.

### Cache-Aside Pattern (Our Implementation)

```
1. Check cache for data
2. If cache miss → query database → store in cache → return data
3. If cache hit → return cached data
```

### Cache Invalidation

The hardest problem in caching is knowing when to invalidate (delete) cached data. Strategies:

| Strategy | When to Invalidate |
|----------|--------------------|
| **TTL (Time to Live)** | After X seconds/minutes |
| **On Write** | When data is updated/deleted |
| **On Read** | If data is stale |

### Redis in Our Project

We use Redis for:
- API response caching
- Rate limiting counters
- Session storage

---

## 4. API Design & Best Practices

### RESTful Conventions

| Method | Purpose | Idempotent? |
|--------|---------|-------------|
| GET | Retrieve data | Yes |
| POST | Create new resource | No |
| PUT | Replace entire resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (logged in but no permission) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Pagination

**Offset-based** (simpler but has issues at large offsets):
```sql
SELECT * FROM users LIMIT 10 OFFSET 1000
```

**Cursor-based** (better for large datasets):
```sql
SELECT * FROM users WHERE id > last_seen_id LIMIT 10
```

Cursor-based is faster because it doesn't need to count all previous rows.

### Field Selection

Allow clients to request only needed fields:
```
GET /users?fields=id,name,email
```
Reduces payload size significantly.

---

## 5. Security

### Helmet.js

Sets various HTTP headers to protect against common web vulnerabilities:

```typescript
app.use(helmet());
```

Headers set:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

### CORS (Cross-Origin Resource Sharing)

Controls which domains can access your API:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true
}));
```

### Rate Limiting

Prevents abuse by limiting requests per time window:

```typescript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
}));
```

---

## 6. Performance & Optimization

### Response Compression

Compresses responses sent to clients:

```typescript
app.use(compression());
```

Reduces response size by ~70% for JSON.

### Keep-Alive

Reuses TCP connections instead of creating new ones for each request. Already enabled by default in Node.js and most servers.

### Connection Pooling

Maintains a pool of database connections ready to use:

```typescript
const prisma = new PrismaClient();
// Prisma manages pool automatically
```

---

## 7. Error Handling

### Global Error Handler

All errors flow to one place:

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  // Format response
  // Send appropriate status code
});
```

### Custom Error Classes

Create specific error types for different situations:

```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true
  ) {
    super(message);
  }
}
```

### Async Error Handling

Express doesn't catch Promise rejections by default. Use a wrapper:

```typescript
const asyncHandler = (fn: RequestHandler) => 
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Usage
router.get('/users', asyncHandler(userController.getAll));
```

---

## 8. Authentication & Authorization

### JWT (JSON Web Tokens)

Stateless authentication mechanism:

```
1. User logs in → Server issues JWT (signed token)
2. Client stores JWT
3. Client sends JWT in Authorization header
4. Server verifies signature → grants access
```

### Access vs Refresh Tokens

| Token | Purpose | Lifetime | Storage |
|-------|---------|----------|---------|
| Access | Authorize requests | Short (15 min) | Memory/in memory |
| Refresh | Get new access tokens | Long (7 days) | HTTP-only cookie |

### Password Hashing

Never store passwords in plain text. Use bcrypt:

```typescript
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);
```

### RBAC (Role-Based Access Control)

```typescript
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Middleware
const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
};
```

---

## 9. Real-time Communication

### WebSockets vs HTTP

| | HTTP | WebSockets |
|--|------|------------|
| Direction | Client requests, server responds | Bidirectional |
| Connection | New connection each request | Persistent connection |
| Use case | REST APIs | Real-time updates |

### Socket.io Features

- **Rooms**: Group users (e.g., chat rooms)
- **Broadcasting**: Send to all connected clients
- **Events**: Custom event names
- **Fallback**: Works even if WebSocket fails (polling)

---

## 10. Validation

### Why Zod?

Zod provides runtime validation with TypeScript inference:

```typescript
const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional()
});

// TypeScript type inferred from schema
type User = z.infer<typeof UserSchema>;
```

### Validation in Controllers

```typescript
const createUser = (req: Request, res: Response) => {
  const result = UserSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.flatten()
    });
  }
  
  // result.data is typed as User
  const user = await userService.create(result.data);
};
```

---

## 11. Documentation

### Swagger/OpenAPI

Machine-readable API documentation:

```typescript
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
```

Benefits:
- Auto-generated UI for testing
- Client SDK generation
- Contract testing

---

## 12. Testing

### Test Types

| Type | What it tests | Speed | Isolation |
|------|---------------|-------|-----------|
| Unit | Individual functions | Fast | High |
| Integration | Multiple components | Medium | Medium |
| E2E | Entire application | Slow | Low |

### Testing with Jest

```typescript
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test'
    });
    
    expect(user.email).toBe('test@example.com');
  });
});
```

### Integration Testing with Supertest

```typescript
describe('GET /api/users', () => {
  it('should return users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

---

## 13. Logging & Observability

### Pino Logger

Pino is extremely fast (10x faster than Winston):

```typescript
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' }
    : undefined
});
```

### Request IDs

Every request gets a unique ID for tracing:

```typescript
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  next();
});
```

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/health` | Is the app running? |
| `/health/ready` | Can the app serve traffic? (checks DB, Redis) |

---

## 14. DevOps & Deployment

### Docker

Containerize your application:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --production --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Docker Compose

Orchestrate multiple services:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
  
  redis:
    image: redis:7
```

### Environment Variables

Never hardcode configuration:

```typescript
const config = {
  port: parseInt(process.env.PORT || '3000'),
  db: {
    url: process.env.DATABASE_URL!
  }
};
```

---

## 15. Reliability & Production

### Graceful Shutdown

Handle termination signals properly:

```typescript
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down...`);
  
  server.close(async () => {
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Timeouts

Prevent hanging requests:

```typescript
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(503).json({ error: 'Request timeout' });
  });
  next();
});
```

### Idempotency

Same request shouldn't cause different results:

```typescript
// Use idempotency keys
app.post('/payments', async (req, res) => {
  const { idempotencyKey } = req.body;
  
  // Check if already processed
  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey }
  });
  
  if (existing) return res.json(existing);
  
  // Process payment
});
```

---

## Summary

This project demonstrates production-ready patterns used in real-world applications. Each component follows industry best practices and is designed to be:

- **Maintainable**: Clean separation of concerns
- **Testable**: Dependency injection, interfaces
- **Scalable**: Caching, connection pooling, rate limiting
- **Secure**: Authentication, authorization, security headers
- **Observable**: Logging, health checks
- **Reliable**: Error handling, graceful shutdown

Use the LEARN.md file to navigate through the implementation and understand how each concept is applied in practice.
