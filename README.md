# Express.js Production-Ready API

A comprehensive Express.js boilerplate demonstrating production-ready patterns for building scalable, secure, and maintainable APIs.

## Features

- **Clean Architecture** - Layered structure (controllers → services → repositories)
- **TypeScript** - Full type safety
- **Drizzle ORM** - Type-safe database queries with PostgreSQL
- **Redis Caching** - Cache-aside pattern implementation
- **Authentication** - JWT with access & refresh tokens
- **Rate Limiting** - Per-IP and per-user throttling
- **WebSockets** - Real-time communication with Socket.io
- **API Documentation** - Swagger/OpenAPI auto-generated docs
- **Docker** - Containerization with Docker Compose
- **Testing** - Jest with unit and integration tests
- **Logging** - Pino structured JSON logging

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Drizzle |
| Cache | Redis |
| WebSockets | Socket.io |
| Validation | Zod |
| Documentation | Swagger |
| Testing | Jest + Supertest |
| Container | Docker |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

1. **Clone and install dependencies:**
```bash
yarn install
```

2. **Start with Docker:**
```bash
docker-compose up -d
```

3. **Run database migrations:**
```bash
yarn db:migrate
```

4. **Start development server:**
```bash
yarn dev
```

### Environment Variables

Create `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/express_app

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## API Endpoints

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | List all users | Yes |
| GET | `/api/v1/users/:id` | Get user by ID | Yes |
| POST | `/api/v1/users` | Create user | Yes |
| PUT | `/api/v1/users/:id` | Update user | Yes |
| DELETE | `/api/v1/users/:id` | Delete user | Yes |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Deep health check |

### WebSocket
- Connect to `http://localhost:3000`
- Events: `user:created`, `user:updated`, `user:deleted`

## Scripts

```bash
# Development
yarn dev          # Start dev server with hot reload
yarn build        # Compile TypeScript

# Database
yarn db:generate  # Generate Drizzle client
yarn db:migrate   # Run migrations
yarn db:push      # Push schema to database
yarn db:seed      # Seed database

# Testing
yarn test             # Run all tests
yarn test:watch   # Watch mode
yarn test:coverage # Coverage report

# Linting
yarn lint         # Run ESLint
yarn format       # Format code
```

## Documentation

See the `docs/` folder for detailed guides:

| File | Description |
|------|-------------|
| [docs/LEARN.md](./docs/LEARN.md) | Step-by-step learning guide |
| [docs/TOPICS.md](./docs/TOPICS.md) | Core topics covered |
| [docs/AUTH_INFO.md](./docs/AUTH_INFO.md) | Authentication deep dive |
| [docs/EXPLANATION.md](./docs/EXPLANATION.md) | Architecture explanation |

Access Swagger UI at: `http://localhost:3000/api-docs`

---

## Project Structure

```
src/
├── config/           # Environment & service configuration
├── controllers/     # HTTP request handling (thin)
├── services/        # Business logic (thick)
├── repositories/    # Data access layer
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── types/           # TypeScript interfaces
├── utils/           # Helpers & error classes
├── app.ts          # Express app setup
└── server.ts       # Entry point
```

## Documentation

See the `docs/` folder for detailed guides:

| File | Description |
|------|-------------|
| [docs/LEARN.md](./docs/LEARN.md) | Step-by-step learning guide |
| [docs/TOPICS.md](./docs/TOPICS.md) | Core topics covered |
| [docs/AUTH_INFO.md](./docs/AUTH_INFO.md) | Authentication deep dive |
| [docs/EXPLANATION.md](./docs/EXPLANATION.md) | Architecture explanation |

Access Swagger UI at: `http://localhost:3000/api-docs`

## License

MIT
