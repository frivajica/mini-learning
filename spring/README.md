# Spring Boot Mini Project

Production-ready Spring Boot 3.5 reference implementation for learning modern Java backend development.

## Quick Start

```bash
# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Build and run
./mvnw spring-boot:run

# Run tests
./mvnw test
```

## Features

- **JWT Authentication** with access + refresh tokens
- **httpOnly cookie** support for refresh tokens
- **PostgreSQL** with JPA/Hibernate
- **Redis** for rate limiting
- **Bean Validation** with Jakarta Validation
- **Spring Actuator** for health checks
- **Flyway** for database migrations
- **RESTful API** with versioning

## Tech Stack

| Component  | Technology                       |
| ---------- | -------------------------------- |
| Framework  | Spring Boot 3.5                  |
| Language   | Java 21                          |
| Security   | Spring Security 7.x + JWT (jjwt) |
| Database   | PostgreSQL 16                    |
| ORM        | Spring Data JPA                  |
| Validation | Jakarta Bean Validation          |
| Cache      | Redis 7                          |
| Build      | Maven                            |

## Project Structure

```
src/main/java/com/mini/
├── config/           # Security, Redis, CORS configuration
├── controller/       # REST endpoints (Auth, User, Health)
├── service/          # Business logic
├── repository/      # Data access (JPA)
├── model/            # JPA entities
├── dto/              # Request/Response objects
├── security/         # JWT handling
├── exception/        # Error handling
└── util/             # Utilities
```

## API Endpoints

| Method | Endpoint              | Description       | Auth   |
| ------ | --------------------- | ----------------- | ------ |
| POST   | /api/v1/auth/register | Register new user | Public |
| POST   | /api/v1/auth/login    | Login             | Public |
| POST   | /api/v1/auth/refresh  | Refresh token     | Public |
| POST   | /api/v1/auth/logout   | Logout            | Public |
| GET    | /api/v1/users         | List users        | ADMIN  |
| GET    | /api/v1/users/{id}    | Get user by ID    | Auth   |
| GET    | /api/v1/health        | Health check      | Public |
| GET    | /actuator/health      | Actuator health   | Public |

## Authentication Flow

```
1. Register/Login → Returns accessToken + refreshToken
2. Use accessToken in Authorization header: "Bearer <token>"
3. When accessToken expires → POST /api/v1/auth/refresh
4. Logout → POST /api/v1/auth/logout (revokes refresh token)
```

## Environment Variables

| Variable          | Default                                      | Description       |
| ----------------- | -------------------------------------------- | ----------------- |
| DATABASE_URL      | jdbc:postgresql://localhost:5432/mini_spring | PostgreSQL URL    |
| DATABASE_USER     | postgres                                     | Database username |
| DATABASE_PASSWORD | postgres                                     | Database password |
| REDIS_URL         | redis://localhost:6379                       | Redis URL         |
| JWT_SECRET        | (see application.yml)                        | JWT signing key   |
| PORT              | 8080                                         | Server port       |

## Documentation

- [LEARN.md](docs/LEARN.md) - Learning path and concepts
- [COMPARISON.md](../docs/COMPARISON.md) - Compare with other frameworks

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
