# Learning Path

Follow this path to master full-stack development progressively.

---

## Recommended Order

### 1. Express + PostgreSQL (Start Here)

**Why**: Minimal setup, clear patterns, direct control.

Learn:

- HTTP basics (request/response)
- Middleware pattern
- Routing
- Database queries with Drizzle ORM
- Authentication middleware

**Next directory**: [express/](express/)

---

### 2. Express + MongoDB

**Why**: Learn document database patterns vs relational. Same Express patterns, different data model.

Learn:

- MongoDB document model
- Mongoose ODM schema validation
- Embedding vs referencing patterns
- Schema flexibility
- Redis caching

**Next directory**: [express-mongo/](express-mongo/)

---

### 3. FastAPI

**Why**: Same backend concepts but with Python's async simplicity.

Learn:

- Async/await patterns
- Pydantic validation
- Auto-generated docs (Swagger UI)
- Dependency injection

**Next directory**: [fastapi/](fastapi/)

---

### 4. NestJS

**Why**: Scalable architecture for Node.js.

Learn:

- Module organization
- Dependency injection
- Guards and interceptors
- Microservices patterns
- TypeORM/Prisma integration

**Next directory**: [nest/](nest/)

---

### 5. Next.js (Finish Here)

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

### 6. Next.js + Supabase (Real-time & Payments)

**Why**: Learn backend-as-a-service patterns with Supabase, real-time subscriptions, and Stripe payments.

Learn:

- Supabase Auth with httpOnly cookies
- Row Level Security (RLS) policies
- Real-time database subscriptions
- Server Actions for mutations
- React Query integration
- Stripe Checkout and Customer Portal
- Supabase vs traditional backend tradeoffs

**Next directory**: [next-supabase/](next-supabase/)

---

### 7. TanStack Start (Alternative Frontend)

**Why**: Type-safe React framework with TanStack Router for projects needing different patterns than Next.js.

Learn:

- File-based routing with TanStack Router
- Server functions (RPC-style)
- Type-safe API contracts
- React Query integration

**Next directory**: [tanstack-start/](tanstack-start/)

---

### 8. Spring Boot (Enterprise Java)

**Why**: Enterprise-grade Java framework with Spring Security and JPA.

Learn:

- Spring Security configuration
- JPA entities and repositories
- Dependency injection
- Security filter chain
- JWT authentication in Java

**Next directory**: [spring/](spring/)

---

### 9. Spring Boot + Lombok (Reduced Boilerplate)

**Why**: Same Spring Boot but with Lombok for industry-standard reduced boilerplate.

Learn:

- Lombok annotations (@Data, @Getter, etc.)
- Cleaner entity definitions
- Industry-standard Java patterns

**Next directory**: [spring-lombok/](spring-lombok/)

---

## When to Use Each

| Scenario                      | Use             |
| ----------------------------- | --------------- |
| Simple API, Node.js           | Express (PG)    |
| Document data, Schema flex    | Express (Mongo) |
| Quick API, Python             | FastAPI         |
| Large team, scalable Node.js  | NestJS          |
| Full-stack React app          | Next.js         |
| Real-time + payments (BaaS)   | Next-Supabase   |
| Microservices                 | NestJS          |
| Learning backend fundamentals | Express (PG)    |
| Learning document databases   | Express (Mongo) |
| Learning BaaS patterns        | Next-Supabase   |

## Study Tips

1. **Compare side-by-side**: Use [COMPARISON.md](COMPARISON.md) to see the same feature across frameworks
2. **Run all locally**: Each has Docker compose for PostgreSQL + Redis
3. **Focus on patterns**: The concepts transfer between frameworks
4. **Check each README**: Each project has its own LEARN.md with framework-specific details
