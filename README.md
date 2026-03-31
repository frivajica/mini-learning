# mini-learning

Production-ready reference implementations for learning modern backend and frontend frameworks.

## Projects

| Framework  | Directory            | Description                                            |
| ---------- | -------------------- | ------------------------------------------------------ |
| Next.js 16 | [next/](next/)       | React framework with App Router, JWT auth, React Query |
| Express    | [express/](express/) | Minimal Node.js API with TypeScript, Drizzle ORM       |
| NestJS     | [nest/](nest/)       | Scalable Node.js architecture, modules, DI             |
| FastAPI    | [fastapi/](fastapi/) | Python async API with Pydantic, SQLAlchemy             |

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
```

## Documentation

- [Learning Path](docs/LEARN.md) - Which framework to study and when
- [Framework Comparison](docs/COMPARISON.md) - Side-by-side code comparisons

## Tech Stack

| Category   | Next.js     | Express    | NestJS          | FastAPI     |
| ---------- | ----------- | ---------- | --------------- | ----------- |
| Language   | TypeScript  | TypeScript | TypeScript      | Python      |
| Framework  | Next.js 16  | Express    | NestJS          | FastAPI     |
| Database   | PostgreSQL  | PostgreSQL | PostgreSQL      | PostgreSQL  |
| ORM        | Drizzle     | Drizzle    | TypeORM/Prisma  | SQLAlchemy  |
| Auth       | NextAuth.js | JWT        | @nestjs/jwt     | python-jose |
| Cache      | Redis       | Redis      | Redis           | Redis       |
| Validation | Zod         | Zod        | class-validator | Pydantic    |
| API Style  | REST        | REST       | REST            | REST        |

## Features

Each project implements the same feature set for fair comparison:

- User authentication (JWT + refresh tokens)
- httpOnly cookie storage
- Rate limiting
- Input validation
- Error handling
- Database migrations
- Docker compose setup
