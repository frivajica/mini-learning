# Mini MongoDB Express

A production-ready Product Catalog API demonstrating MongoDB patterns with Mongoose ODM, JWT authentication, Redis caching, rate limiting, and role-based access control.

## Features

- **MongoDB with Mongoose ODM** - Schema validation, embedding, and referencing patterns
- **Full JWT Authentication** - Access tokens (15m) + refresh tokens (7d) with HTTP-only cookies
- **Role-Based Access Control (RBAC)** - ADMIN role for CRUD operations on products, categories; USER role for orders
- **Redis Caching** - Product and category caching with automatic invalidation using Redis Sets (non-blocking)
- **Rate Limiting** - Global and auth-specific rate limits
- **Locked Prices** - Product prices are captured at order time (price cannot change after order)
- **RESTful API** - Products, Categories, Orders, and Auth endpoints
- **TypeScript** - Full type safety with strict mode
- **ESLint** - Code linting with TypeScript support
- **Zod Validation** - Request validation
- **Docker Support** - MongoDB and Redis via docker-compose
- **Health Checks** - Liveness and readiness probes for container orchestration
- **Connection Retry** - MongoDB connection with exponential backoff retry
- **Graceful Shutdown** - Proper signal handling for SIGTERM/SIGINT

## Quick Start

```bash
# Install dependencies
yarn install

# Start MongoDB and Redis
docker-compose up -d

# Start development server
yarn dev

# Run tests
yarn test

# Run lint
yarn lint

# Build for production
yarn build
```

## API Endpoints

### Auth

| Method | Endpoint              | Description          | Auth   |
| ------ | --------------------- | -------------------- | ------ |
| POST   | /api/v1/auth/register | Register user        | Public |
| POST   | /api/v1/auth/login    | Login user           | Public |
| POST   | /api/v1/auth/refresh  | Refresh access token | Cookie |
| POST   | /api/v1/auth/logout   | Logout user          | Cookie |

### Products

| Method | Endpoint                     | Description               | Auth   |
| ------ | ---------------------------- | ------------------------- | ------ |
| GET    | /api/v1/products             | List products (paginated) | Public |
| GET    | /api/v1/products/:id         | Get product               | Public |
| POST   | /api/v1/products             | Create product            | ADMIN  |
| PUT    | /api/v1/products/:id         | Update product            | ADMIN  |
| DELETE | /api/v1/products/:id         | Delete product            | ADMIN  |
| POST   | /api/v1/products/:id/reviews | Add review                | Public |

### Categories

| Method | Endpoint               | Description     | Auth   |
| ------ | ---------------------- | --------------- | ------ |
| GET    | /api/v1/categories     | List categories | Public |
| GET    | /api/v1/categories/:id | Get category    | Public |
| POST   | /api/v1/categories     | Create category | ADMIN  |
| PUT    | /api/v1/categories/:id | Update category | ADMIN  |
| DELETE | /api/v1/categories/:id | Delete category | ADMIN  |

### Orders

| Method | Endpoint                  | Description         | Auth  |
| ------ | ------------------------- | ------------------- | ----- |
| GET    | /api/v1/orders            | List user orders    | USER  |
| GET    | /api/v1/orders/:id        | Get order           | USER  |
| POST   | /api/v1/orders            | Create order        | USER  |
| PUT    | /api/v1/orders/:id/status | Update order status | ADMIN |

## Health Checks

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/health/live` | Liveness probe | Always 200 OK |
| `/health/ready` | Readiness probe | 200 OK if MongoDB and Redis connected, 503 otherwise |

## Environment Variables

See `.env.example` for required environment variables.

### Production JWT Secrets

In production, set strong JWT secrets via environment variables:

```bash
JWT_SECRET=<your-32-char-secret>
JWT_REFRESH_SECRET=<your-32-char-secret>
```

Or use the docker-compose pattern:
```bash
JWT_SECRET=your-production-secret docker-compose up
```

## Project Structure

```
src/
├── config/         # Configuration (Zod validation, MongoDB, Redis)
├── models/         # Mongoose models (User, Product, Category, Order)
├── services/       # Business logic
├── controllers/   # Request handlers
├── routes/        # Express routes
├── middleware/    # Auth, RBAC, rate limiting, error handling
├── utils/         # Logger, AppError, asyncHandler
└── types/         # TypeScript type exports
```

## Documentation

- [MongoDB vs PostgreSQL Comparison](./docs/MONGODB_VS_POSTGRES.md)
- [MongoDB Patterns](./docs/PATTERNS.md)
- [Authentication Info](./docs/AUTH_INFO.md)
- [Learning Guide](./docs/LEARN.md)
