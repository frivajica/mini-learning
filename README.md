# mini-learning

Production-ready reference implementations for learning modern backend and frontend frameworks.

## Projects

| Framework   | Directory            | Description                                            |
| ----------- | -------------------- | ------------------------------------------------------ |
| Next.js 16  | [next/](next/)       | React framework with App Router, JWT auth, React Query |
| Express     | [express/](express/) | Minimal Node.js API with TypeScript, Drizzle ORM       |
| NestJS      | [nest/](nest/)       | Scalable Node.js architecture, modules, DI             |
| FastAPI     | [fastapi/](fastapi/) | Python async API with Pydantic, SQLAlchemy             |
| Spring Boot | [spring/](spring/)   | Java framework with Spring Security, JPA, DI           |

## Quick Start

Choose your framework:

```bash
# Next.js
cd next && yarn install && yarn dev

# Express
cd express && yarn install && yarn dev

# NestJS
cd nest && yarn install && yarn start:dev

# FastAPI
cd fastapi && pip install -r requirements.txt && uvicorn main:app --reload

# Spring Boot
cd spring && ./mvnw spring-boot:run
```

## Documentation

- [Learning Path](docs/LEARN.md) - Which framework to study and when
- [Framework Comparison](docs/COMPARISON.md) - Side-by-side code comparisons
- [Extra Study Guide](docs/EXTRA_STEPS.md) - Next steps after completing all projects
- [Extra Learning Topics](docs/EXTRA_LEARN.md) - Deep dives into advanced topics

## Tech Stack

| Category   | Next.js     | Express    | NestJS          | FastAPI     | Spring Boot             |
| ---------- | ----------- | ---------- | --------------- | ----------- | ----------------------- |
| Language   | TypeScript  | TypeScript | TypeScript      | Python      | Java 21                 |
| Framework  | Next.js 16  | Express    | NestJS          | FastAPI     | Spring Boot 3.5         |
| Database   | PostgreSQL  | PostgreSQL | PostgreSQL      | PostgreSQL  | PostgreSQL              |
| ORM        | Drizzle     | Drizzle    | TypeORM/Prisma  | SQLAlchemy  | Spring Data JPA         |
| Auth       | NextAuth.js | JWT        | @nestjs/jwt     | python-jose | Spring Security         |
| Cache      | Redis       | Redis      | Redis           | Redis       | Redis                   |
| Validation | Zod         | Zod        | class-validator | Pydantic    | Jakarta Bean Validation |
| API Style  | REST        | REST       | REST            | REST        | REST                    |

## Features

Each project implements the same feature set for fair comparison:

- User authentication (JWT + refresh tokens)
- httpOnly cookie storage
- Rate limiting
- Input validation
- Error handling
- Database migrations
- Docker compose setup

## Learning Path

1. **Express** - Start here for Node.js fundamentals
2. **FastAPI** - Python backend with async
3. **NestJS** - Scalable Node.js architecture
4. **Next.js** - Full-stack React
5. **Spring Boot** - Enterprise Java

See [docs/LEARN.md](docs/LEARN.md) for detailed learning recommendations.
