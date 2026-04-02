# Spring Boot Mini Project (with Lombok)

Production-ready Spring Boot 3.5 reference implementation for learning modern Java backend development.

> **This variant uses [Lombok](https://projectlombok.org/)** to reduce boilerplate. See [docs/LEARN.md](docs/LEARN.md) for details on why Lombok is used in enterprise Java.

## Features

- **JWT Authentication** with access + refresh tokens
- **httpOnly cookie** support for refresh tokens
- **PostgreSQL** with JPA/Hibernate
- **Redis** for rate limiting
- **Bean Validation** with Jakarta Validation
- **Spring Actuator** for health checks
- **Flyway** for database migrations
- **RESTful API** with versioning
- **Lombok** for reduced boilerplate (industry standard)
- **Docker** - Production-ready multi-stage Dockerfile with HEALTHCHECK
- **Health Endpoints** - Liveness and readiness probes for container orchestration
- **Graceful Shutdown** - Proper signal handling
- **JWT Validation** - Startup validation for minimum secret length

## Quick Start

### Using Docker Compose

```bash
cd spring-lombok
cp .env.example .env
# Edit .env and set JWT_SECRET (required, minimum 32 characters)
docker compose up --build
```

### Manual Setup

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Build and run
./mvnw spring-boot:run

# Run tests
./mvnw test
```

## Tech Stack

| Component   | Technology                       |
| ----------- | -------------------------------- |
| Framework   | Spring Boot 3.5                  |
| Language    | Java 21                          |
| Security    | Spring Security 7.x + JWT (jjwt) |
| Database    | PostgreSQL 16                    |
| ORM         | Spring Data JPA                  |
| Validation  | Jakarta Bean Validation          |
| Cache       | Redis 7                          |
| Build       | Maven                            |
| Boilerplate | Lombok (industry standard)       |

## Project Structure

```
spring-lombok/
├── src/main/java/com/mini/
│   ├── config/           # Security, Redis, CORS configuration
│   ├── controller/       # REST endpoints (Auth, User, Health)
│   ├── service/          # Business logic
│   ├── repository/       # Data access (JPA)
│   ├── model/            # JPA entities
│   ├── dto/              # Request/Response objects
│   ├── security/         # JWT handling
│   ├── exception/         # Error handling
│   └── util/             # Utilities
├── src/main/resources/
│   ├── application.yml   # Application configuration
│   └── db/migration/     # Flyway migrations
├── Dockerfile            # Multi-stage production build
├── docker-compose.yml     # Full stack deployment
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md
```

## API Endpoints

| Method | Endpoint                  | Description       | Auth   |
| ------ | ------------------------- | ----------------- | ------ |
| POST   | /api/v1/auth/register     | Register new user | Public |
| POST   | /api/v1/auth/login        | Login             | Public |
| POST   | /api/v1/auth/refresh      | Refresh token     | Public |
| POST   | /api/v1/auth/logout       | Logout            | Public |
| GET    | /api/v1/users             | List users        | ADMIN  |
| GET    | /api/v1/users/{id}        | Get user by ID    | Auth   |
| GET    | /api/v1/health/live        | Liveness probe    | Public |
| GET    | /api/v1/health/ready        | Readiness probe   | Public |
| GET    | /actuator/health/liveness  | Actuator liveness | Public |
| GET    | /actuator/health/readiness | Actuator readiness| Public |

## Authentication Flow

```
1. Register/Login → Returns accessToken + refreshToken
2. Use accessToken in Authorization header: "Bearer <token>"
3. When accessToken expires → POST /api/v1/auth/refresh
4. Logout → POST /api/v1/auth/logout (revokes refresh token)
```

## Environment Variables

| Variable          | Required | Default                                      | Description       |
| ----------------- | -------- | -------------------------------------------- | ----------------- |
| `JWT_SECRET`      | Yes      | -                                            | JWT signing key (min 32 chars) |
| `DATABASE_URL`    | No       | jdbc:postgresql://postgres:5432/mini_spring   | PostgreSQL URL    |
| `DATABASE_USER`   | No       | postgres                                     | Database username |
| `DATABASE_PASSWORD`| No      | postgres                                     | Database password |
| `REDIS_URL`       | No       | redis://redis:6379                           | Redis URL         |
| `CORS_ORIGINS`    | No       | http://localhost:3000                        | Allowed CORS origins |
| `PORT`            | No       | 8080                                         | Server port       |

## Health Endpoints

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `GET /api/v1/health/live` | Liveness probe (is server running?) | No |
| `GET /api/v1/health/ready` | Readiness probe (DB + Redis OK?) | No |

## Documentation

- [LEARN.md](docs/LEARN.md) - Learning path and concepts
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

## Building

```bash
# Clean build
./mvnw clean package

# Skip tests
./mvnw clean package -DskipTests

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AuthServiceTest

# Run with coverage
./mvnw test jacoco:report
```
