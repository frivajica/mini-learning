# Learning Path

Follow this path to master full-stack development progressively.

---

## Recommended Order

### 1. Express (Start Here)

**Why**: Minimal setup, clear patterns, direct control.

Learn:

- HTTP basics (request/response)
- Middleware pattern
- Routing
- Database queries
- Authentication middleware

**Next directory**: [express/](express/)

---

### 2. FastAPI

**Why**: Same backend concepts but with Python's async simplicity.

Learn:

- Async/await patterns
- Pydantic validation
- Auto-generated docs (Swagger UI)
- Dependency injection

**Next directory**: [fastapi/](fastapi/)

---

### 3. NestJS

**Why**: Scalable architecture for Node.js.

Learn:

- Module organization
- Dependency injection
- Guards and interceptors
- Microservices patterns
- TypeORM/Prisma integration

**Next directory**: [nest/](nest/)

---

### 4. Next.js (Finish Here)

**Why**: Full-stack with React frontend + Node.js backend.

Learn:

- Server vs Client Components
- API Routes
- NextAuth.js integration
- React Query for server state
- App Router patterns
- Middleware (proxy.ts in Next.js 16)

**Next directory**: [next/](next/)

---

## When to Use Each

| Scenario                      | Use     |
| ----------------------------- | ------- |
| Simple API, Node.js           | Express |
| Quick API, Python             | FastAPI |
| Large team, scalable Node.js  | NestJS  |
| Full-stack React app          | Next.js |
| Microservices                 | NestJS  |
| Learning backend fundamentals | Express |

## Study Tips

1. **Compare side-by-side**: Use [COMPARISON.md](COMPARISON.md) to see the same feature across frameworks
2. **Run all locally**: Each has Docker compose for PostgreSQL + Redis
3. **Focus on patterns**: The concepts transfer between frameworks
4. **Check each README**: Each project has its own LEARN.md with framework-specific details
