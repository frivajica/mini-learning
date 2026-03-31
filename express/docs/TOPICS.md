# Express.js Learning Project - Topics List

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
16. [Dependency Injection](#16-dependency-injection)

---

## 1. Architecture & Code Organization

| Topic | Description |
|-------|-------------|
| Clean Architecture | Separation into controllers, services, repositories |
| Layered Architecture | Request flow: routes → controllers → services → repositories |
| Dependency Injection | Injecting dependencies, not importing directly |
| SOLID Principles | Single responsibility, Open/Closed, Liskov substitution, Interface segregation, Dependency inversion |
| Project Structure | Organized folder structure for scalability |
| MVC Pattern | Model-View-Controller (adapted for API) |

---

## 2. Database & ORM

| Topic | Description |
|-------|-------------|
| Drizzle ORM | Type-safe database queries with TypeScript |
| PostgreSQL | Relational database with ACID compliance |
| Database Migrations | Schema versioning and updates |
| Connection Pooling | Efficient database connection management |
| Database Indexing | Query optimization strategies |
| N+1 Problem | Avoiding multiple database calls |
| Query Optimization | Using Drizzle `select` and `include` efficiently |
| Database Seeding | Populating initial data for development |
| SQL Injection Prevention | Sanitizing user input in queries |

---

## 3. Caching

| Topic | Description |
|-------|-------------|
| Redis | In-memory data store for caching |
| Cache-Aside Pattern | Application-managed caching |
| Cache Invalidation | Strategies for updating/deleting cache |
| TTL (Time to Live) | Expiring cache entries |
| Caching Strategies | When to cache, what to cache |
| Redis SCAN | Avoiding KEYS command for production |
| Cache Key Design | Proper key naming and versioning |

---

## 4. API Design & Best Practices

| Topic | Description |
|-------|-------------|
| RESTful API | Proper HTTP methods and status codes |
| API Versioning | `/api/v1/` prefix strategy |
| RESTful Conventions | Resource naming, URL structure |
| Pagination | Cursor-based for scalability |
| Pagination Limits | Preventing abuse with max limits |
| Field Selection | `?fields=id,name` to reduce payload |
| ETag Support | Conditional requests for caching |
| Content Negotiation | Handling different response formats |

---

## 5. Security

| Topic | Description |
|-------|-------------|
| Helmet.js | Security headers (CSP, HSTS, X-Frame-Options) |
| CORS | Cross-Origin Resource Sharing configuration |
| Rate Limiting | Preventing abuse with express-rate-limit |
| Request Size Limits | Preventing payload attacks |
| Input Sanitization | Preventing injection attacks |
| HTTPS | SSL/TLS encryption |
| Security Headers | X-Content-Type-Options, Referrer-Policy |
| Secret Management | Environment variable security for production |
| Token Security | JWT secret rotation and validation |

---

## 6. Performance & Optimization

| Topic | Description |
|-------|-------------|
| Response Compression | Gzip/Brotli compression |
| Connection Keep-Alive | Reusing TCP connections |
| Query Optimization | Efficient database queries |
| Connection Pooling | Database connection reuse |
| Async/Await | Non-blocking I/O operations |
| Response Streaming | For large responses |
| Static Asset Handling | Efficient serving of static files |

---

## 7. Error Handling

| Topic | Description |
|-------|-------------|
| Global Error Handler | Centralized error processing |
| Custom Error Classes | Structured error types |
| HTTP Status Codes | Proper 4xx/5xx responses |
| Error Logging | Tracking errors with request context |
| Async Error Wrapper | Handling Promise rejections |
| Validation Errors | Formatted error responses |
| Not Found Handling | 404 for unknown routes |

---

## 8. Authentication & Authorization

| Topic | Description |
|-------|-------------|
| JWT (JSON Web Tokens) | Stateless authentication |
| Access Tokens | Short-lived authentication tokens |
| Refresh Tokens | Long-lived token renewal |
| Password Hashing | bcrypt for secure storage |
| Role-Based Access Control (RBAC) | Permission-based authorization |
| Middleware Protection | Route-level auth checks |
| Token Storage | Secure token handling |

---

## 9. Real-time Communication

| Topic | Description |
|-------|-------------|
| Socket.io | WebSocket implementation |
| Event-Based Communication | Real-time updates |
| Room Management | Grouping connections |
| Broadcasting | Sending to multiple clients |
| Connection Handling | WebSocket lifecycle |

---

## 10. Validation

| Topic | Description |
|-------|-------------|
| Zod | Schema validation library |
| Request Validation | Validating input data |
| Type Validation | Ensuring data types |
| Custom Validators | Business-specific rules |
| Error Messages | User-friendly validation feedback |

---

## 11. Documentation

| Topic | Description |
|-------|-------------|
| Swagger/OpenAPI | API documentation standard |
| Auto-Generated Docs | From code annotations |
| API Endpoint Docs | Request/response schemas |
| Interactive API | Swagger UI for testing |

---

## 12. Testing

| Topic | Description |
|-------|-------------|
| Jest | JavaScript testing framework |
| Unit Tests | Testing individual functions/services |
| Integration Tests | Testing API endpoints |
| Test Database | Isolated testing environment |
| Mocking | Mocking external services |
| Socket.io Mocking | Mocking WebSocket connections |
| Supertest | HTTP testing for Express |
| Test Coverage | Measuring test effectiveness |
| Environment-Based Config | Using .env for test isolation |

---

## 13. Logging & Observability

| Topic | Description |
|-------|-------------|
| Pino | Fast JSON logger |
| Request Logging | HTTP request/response logging |
| Error Logging | Structured error tracking |
| Request IDs | Tracing requests through system |
| Health Checks | `/health` and `/health/ready` endpoints |
| Structured Logs | JSON format for parsing |

---

## 14. DevOps & Deployment

| Topic | Description |
|-------|-------------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Environment Variables | Configuration management |
| Build Process | TypeScript compilation |
| Process Management | PM2 for production |
| CI/CD Basics | Automated testing/deployment |

---

## 15. Reliability & Production

| Topic | Description |
|-------|-------------|
| Graceful Shutdown | Handling process termination |
| Connection Drain | Waiting for pending requests |
| Timeouts | Request timeout handling |
| Circuit Breaker | For external services (reference) |
| Idempotency | Preventing duplicate operations |
| Backup Strategies | Database backups |

---

## 16. Dependency Injection

| Topic | Description |
|-------|-------------|
| Manual DI | Constructor injection without external libraries |
| Interface-Based Design | Defining contracts for repositories and services |
| DI Container | Centralized wiring of dependencies |
| Singleton Scope | One instance for repositories/services (connection pools) |
| Per-Request Scope | Fresh controller instances per request |
| Mocking for Tests | Easy testability by injecting mocks |

### Implementation Files
- `src/di/container.ts` - DI container wiring
- `src/types/interfaces/repositories.ts` - Repository interfaces
- `src/types/interfaces/services.ts` - Service interfaces
- `src/services/userService.ts` - Constructor injection example
- `src/controllers/userController.ts` - Controller injection example

---

## Interview Focus Areas

| Priority | Topics |
|----------|--------|
| **High** | Clean Architecture, REST API, Error Handling, Authentication, Database/ORM, Caching, Performance |
| **Medium** | Security, Rate Limiting, WebSockets, Testing, Logging, Docker |
| **Low** | Swagger, Metrics, Advanced Patterns |
