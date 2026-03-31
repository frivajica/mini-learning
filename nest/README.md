# NestJS Production API

A production-ready NestJS API project for learning modern Node.js backend development.

---

## Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT + Refresh Tokens |
| Authorization | Role-based access control (RBAC) |
| Database | PostgreSQL with Drizzle ORM |
| Validation | Zod with ValidationPipe |
| Security | Helmet, CORS, Rate Limiting |
| API Documentation | Swagger/OpenAPI |
| Error Handling | Global Exception Filter |
| Logging | Request ID tracing |
| Health Checks | `/health`, `/health/ready` |
| Docker | Dockerfile + docker-compose |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Running Locally

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env

# Generate database schema
yarn db:generate

# Start development server
yarn start:dev
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |

### Users (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users (paginated) |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user (admin only) |
| PUT | `/api/v1/users/:id` | Update user |
| PUT | `/api/v1/users/:id/role` | Update user role (admin only) |
| DELETE | `/api/v1/users/:id` | Delete user (admin only) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Readiness check (includes DB) |

---

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/      # Passport JWT strategy
│   ├── guards/          # Authorization guards
│   └── dto/             # Data transfer objects
├── users/               # Users module
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
├── health/              # Health check module
├── database/            # Drizzle ORM setup
├── common/
│   ├── decorators/      # Custom decorators (Roles)
│   ├── filters/        # Exception filters
│   └── interceptors/   # Logging interceptor
├── config/             # Configuration
├── app.module.ts
└── main.ts
```

---

## Environment Variables

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestjs
REDIS_URL=redis://localhost:6379

JWT_SECRET=your-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:3000

BCRYPT_ROUNDS=12

RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

---

## Key Differences from Express

See [docs/NEST_VS_EXPRESS.md](./docs/NEST_VS_EXPRESS.md) for a detailed comparison.

---

## Commands

```bash
yarn build          # Build for production
yarn start          # Start production server
yarn start:dev      # Start development server
yarn test           # Run tests
yarn db:generate    # Generate database migration
yarn db:push        # Push schema to database
```

---

## Learning Resources

- [docs/LEARN.md](./docs/LEARN.md) - How to learn NestJS from this project
- [docs/NEST_VS_EXPRESS.md](./docs/NEST_VS_EXPRESS.md) - Express vs NestJS comparison
