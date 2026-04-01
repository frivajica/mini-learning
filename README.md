# mini-learning

Production-ready reference implementations for learning modern backend and frontend frameworks.

> **Purpose**: This repo is a personal learning laboratory for improving skills and exploring interesting technologies in depth. Made public in case anyone else finds it useful for learning.

## Projects

| Framework            | Directory                          | Description                                                 |
| -------------------- | ---------------------------------- | ----------------------------------------------------------- |
| Next.js 15           | [next/](next/)                     | React framework with App Router, NextAuth.js, React Query   |
| Next.js + Supabase   | [next-supabase/](next-supabase/)   | Next.js with Supabase, real-time, Stripe subscriptions      |
| Next.js + Payload    | [payload/](payload/)               | Self-hosted headless CMS with built-in admin UI             |
| TanStack Start       | [tanstack-start/](tanstack-start/) | Full-stack React with file routing, server functions        |
| Express + PostgreSQL | [express/](express/)               | Minimal Node.js API with TypeScript, Drizzle ORM            |
| Express + MongoDB    | [express-mongo/](express-mongo/)   | Express API with MongoDB, Mongoose, Redis caching           |
| NestJS               | [nest/](nest/)                     | Scalable Node.js architecture, modules, DI                  |
| FastAPI              | [fastapi/](fastapi/)               | Python async API with Pydantic, SQLAlchemy                  |
| Spring Boot          | [spring/](spring/)                 | Java framework with Spring Security, JPA, DI                |
| Spring Boot + Lombok | [spring-lombok/](spring-lombok/)   | Same as Spring Boot but with Lombok for reduced boilerplate |

## Quick Start

Choose your framework:

```bash
# Next.js with NextAuth.js
cd next && yarn install && yarn dev

# Next.js with Supabase (real-time + Stripe)
cd next-supabase && yarn install && docker-compose up -d && yarn dev

# Next.js with Payload CMS (headless CMS)
cd payload && yarn install && yarn dev

# TanStack Start
cd tanstack-start && yarn install && yarn dev

# Express + PostgreSQL
cd express && yarn install && yarn dev

# Express + MongoDB
cd express-mongo && yarn install && yarn dev

# NestJS
cd nest && yarn install && yarn start:dev

# FastAPI
cd fastapi && pip install -r requirements.txt && uvicorn main:app --reload

# Spring Boot (manual boilerplate)
cd spring && ./mvnw spring-boot:run

# Spring Boot + Lombok (reduced boilerplate)
cd spring-lombok && ./mvnw spring-boot:run
```

## Documentation

- [Learning Path](docs/LEARN.md) - Which framework to study and when
- [Framework Comparison](docs/COMPARISON.md) - Side-by-side code comparisons
- [Extra Study Guide](docs/EXTRA_STEPS.md) - Next steps after completing all projects
- [Extra Learning Topics](docs/EXTRA_LEARN.md) - Deep dives into advanced topics

## Tech Stack

| Category    | Next.js     | Next-Supabase     | Payload CMS     | TanStack Start | Express (PG) | Express (Mongo) | NestJS          | FastAPI     | Spring Boot       | Spring Boot + Lombok |
| ----------- | ----------- | ----------------- | --------------- | -------------- | ------------ | --------------- | --------------- | ----------- | ----------------- | -------------------- |
| Language    | TypeScript  | TypeScript        | TypeScript      | TypeScript     | TypeScript   | TypeScript      | TypeScript      | Python      | Java 21           | Java 21              |
| Framework   | Next.js 15  | Next.js 15        | Next.js 15      | TanStack Start | Express      | Express         | NestJS          | FastAPI     | Spring Boot 3.5   | Spring Boot 3.5      |
| Database    | PostgreSQL  | Supabase PG       | SQLite/Postgres | PostgreSQL     | PostgreSQL   | MongoDB         | PostgreSQL      | PostgreSQL  | PostgreSQL        | PostgreSQL           |
| ORM         | Drizzle     | Supabase          | Built-in CMS    | Drizzle        | Drizzle      | Mongoose        | TypeORM/Prisma  | SQLAlchemy  | Spring Data JPA   | Spring Data JPA      |
| Auth        | NextAuth.js | Supabase Auth     | Built-in CMS    | Server fns     | JWT          | JWT + RBAC      | @nestjs/jwt     | python-jose | Spring Security   | Spring Security      |
| Cache       | Redis       | React Query       | -               | Redis          | Redis        | Redis           | Redis           | Redis       | Redis             | Redis                |
| Validation  | Zod         | Zod               | Built-in CMS    | Zod            | Zod          | Zod             | class-validator | Pydantic    | Jakarta Bean Val. | Jakarta Bean Val.    |
| Routing     | App Router  | App Router        | App Router      | File-based     | Express      | Express         | Modules         | FastAPI     | Controllers       | Controllers          |
| Boilerplate | Manual      | Manual            | CMS-based       | Minimal        | Manual       | Manual          | Opinionated     | Minimal     | Manual            | Lombok               |
| API Style   | REST        | REST              | REST + Admin UI | REST           | REST         | REST            | REST            | REST        | REST              | REST                 |
| Extra       | -           | Real-time, Stripe | Admin UI, CMS   | -              | -            | -               | -               | -           | -                 | -                    |

## Features

Each project implements the same feature set for fair comparison:

- User authentication (JWT + refresh tokens)
- httpOnly cookie storage
- Rate limiting
- Input validation
- Error handling
- Database migrations (PostgreSQL) / Schema validation (MongoDB)
- Docker compose setup

> **Note**: Express + MongoDB uses document embedding/referencing patterns instead of SQL joins. See [express-mongo/docs/MONGODB_VS_POSTGRES.md](express-mongo/docs/MONGODB_VS_POSTGRES.md) for comparison.
>
> **Supabase Projects**: next-supabase demonstrates Supabase Auth, real-time subscriptions, and Stripe integration. See [next-supabase/docs/](next-supabase/docs/) for details.
>
> **Payload CMS Projects**: payload demonstrates headless CMS patterns with built-in admin UI, authentication, and file storage. See [payload/](payload/) for details.

## Learning Path

1. **Express** - Start here for Node.js fundamentals
2. **FastAPI** - Python backend with async
3. **NestJS** - Scalable Node.js architecture
4. **Next.js** - Full-stack React
5. **Next.js + Supabase** - Real-time subscriptions and Stripe payments
6. **Next.js + Payload CMS** - Headless CMS with built-in admin UI
7. **TanStack Start** - Type-safe React framework with TanStack Router
8. **Spring Boot** - Enterprise Java (manual boilerplate)
9. **Spring Boot + Lombok** - Enterprise Java with Lombok (industry standard)

> For Spring Boot, start with `spring/` to understand the boilerplate, then move to `spring-lombok/` to see how Lombok simplifies it.
>
> For backend-as-a-service patterns, study `next-supabase/` after completing `next/`.
>
> For content management with a built-in admin UI, study `payload/` after completing `next/`.

See [docs/LEARN.md](docs/LEARN.md) for detailed learning recommendations.
