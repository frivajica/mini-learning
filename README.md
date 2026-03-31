# FastAPI Production API

A production-ready FastAPI project for learning modern Python backend development.

---

## Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT + Refresh Tokens |
| Authorization | Role-based access control (RBAC) |
| Database | PostgreSQL with SQLAlchemy |
| Validation | Pydantic |
| API Documentation | Built-in Swagger/OpenAPI |
| Error Handling | Global exception handler |
| Docker | Dockerfile + docker-compose |

---

## Quick Start

### Prerequisites
- Python 3.11+
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
# Install dependencies with uv
uv sync

# Or with pip
pip install -e .

# Copy environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn src.main:app --reload
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
| GET | `/api/v1/users/me` | Get current user |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user (admin only) |
| PUT | `/api/v1/users/:id` | Update user |
| PUT | `/api/v1/users/:id/role` | Update user role (admin only) |
| DELETE | `/api/v1/users/:id` | Delete user (admin only) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Readiness check (includes DB, Redis) |

---

## Project Structure

```
src/
├── api/
│   └── routes/           # API endpoints
│       ├── auth.py
│       ├── users.py
│       └── health.py
├── core/
│   ├── config.py         # Configuration
│   └── security.py       # JWT, password hashing
├── db/
│   ├── models.py        # SQLAlchemy models
│   ├── repositories.py  # Data access layer
│   └── redis.py         # Redis client
├── schemas/
│   └── user.py          # Pydantic schemas
├── services/
│   ├── user_service.py  # Business logic
│   └── cache_service.py # Caching
├── dependencies.py       # FastAPI dependencies
└── main.py              # Application entry point
```

---

## Environment Variables

```env
# Server
APP_NAME=FastAPI Production
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/fastapi

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-minimum-32-characters
JWT_REFRESH_SECRET_KEY=your-jwt-refresh-secret-key-minimum-32
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## Commands

```bash
uv sync              # Install dependencies
uv run uvicorn src.main:app --reload  # Development server
alembic upgrade head # Run migrations
pytest               # Run tests
pytest --cov        # Run with coverage
```

---

## Documentation

- [docs/LEARN.md](./docs/LEARN.md) - Learning guide with code references
- Swagger UI: `http://localhost:3000/api-docs`
