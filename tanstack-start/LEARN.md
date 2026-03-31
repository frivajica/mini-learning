# Learning TanStack Start

A guide for developers familiar with Next.js to learn TanStack Start.

## Table of Contents

1. [Why TanStack Start?](#why-tanstack-start)
2. [Core Concepts](#core-concepts)
3. [TanStack Start vs Next.js](#tanstack-start-vs-nextjs)
4. [File-Based Routing](#file-based-routing)
5. [Server Functions](#server-functions)
6. [Data Fetching with TanStack Query](#data-fetching-with-tanstack-query)
7. [Route Protection](#route-protection)
8. [API Reference](#api-reference)

---

## Why TanStack Start?

TanStack Start is a **type-safe, client-first** full-stack React framework.

### Key Benefits

| Benefit           | Description                                     |
| ----------------- | ----------------------------------------------- |
| Type-safe routing | Auto-generated route tree with full type safety |
| TanStack Query    | Best-in-class data fetching built-in            |
| Client-first      | You control when things run server vs client    |
| Minimal           | Less abstraction, more control                  |

### When to Use

- ✅ Complex client-side state management
- ✅ When you need TanStack Query deeply integrated
- ✅ TypeScript-first projects
- ✅ Projects needing fine-grained caching control

- ❌ Simple static sites (use Next.js or Vite)
- ❌ When you need server-first SSR (Next.js is better)

---

## Core Concepts

### 1. File-Based Routing

Routes are defined by file structure in `src/routes/`.

### 2. Type-Safe Routes

TanStack Router auto-generates a route tree with full type safety.

### 3. Server Functions

Type-safe functions that run on the server.

### 4. TanStack Query Integration

First-class data fetching and caching support.

---

## TanStack Start vs Next.js

### Routing Comparison

| Aspect           | Next.js           | TanStack Start         |
| ---------------- | ----------------- | ---------------------- |
| Route Definition | Files in `app/`   | Files in `src/routes/` |
| Route Groups     | `(group)` folders | `_group` prefix        |
| Protected Routes | `middleware.ts`   | `beforeLoad` hook      |
| Type Safety      | Manual params     | Auto-generated         |
| Layouts          | `layout.tsx`      | Same pattern           |

### Next.js App Router

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return <div>Login</div>;
}
```

### TanStack Start

```tsx
// src/routes/login.tsx
export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return <div>Login</div>;
}
```

### Auth Protection

**Next.js** - Middleware runs before rendering:

```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.redirect("/login");
  }
}
```

**TanStack Start** - beforeLoad runs with the route:

```tsx
// routes/_authed.tsx
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user };
  },
});
```

---

## File-Based Routing

### Route File Structure

```
src/routes/
├── index.tsx              # / (home)
├── login.tsx              # /login
├── register.tsx            # /register
├── _authed.tsx            # Layout for protected routes
├── _authed/dashboard.tsx  # /dashboard
└── _authed/users.tsx      # /users
```

### Route Naming Convention

| Prefix | Meaning               | Example                        |
| ------ | --------------------- | ------------------------------ |
| (none) | Public route          | `login.tsx` → `/login`         |
| `_`    | Layout/component only | `_authed.tsx` → layout         |
| `$`    | Dynamic segment       | `users.$id.tsx` → `/users/:id` |

### Creating a Route

```tsx
// src/routes/users.$id.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$id")({
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  return <div>User ID: {id}</div>;
}
```

---

## Server Functions

### What are Server Functions?

Type-safe functions that run exclusively on the server. Similar to Next.js Server Actions but with different syntax.

### Defining a Server Function

```tsx
import { createServerFn } from "@tanstack/react-start/server";

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    // This runs on the server
    const user = await validateUser(data.email, data.password);
    return { user };
  });
```

### Using a Server Function

```tsx
// Client-side
const handleLogin = async (email: string, password: string) => {
  const result = await loginFn({ data: { email, password } });
  if (result.data?.user) {
    router.history.push("/dashboard");
  }
};
```

### Server Function Validation

```tsx
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    // data is fully typed after validation
    const user = await validateUser(data.email, data.password);
    return { user };
  });
```

---

## Data Fetching with TanStack Query

### In Routes (Recommended)

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: async () => {
    const res = await fetch("/api/users");
    return res.json();
  },
});

export const Route = createFileRoute("/users")({
  loader: async () => {
    // Server-side prefetch
    return queryClient.ensureQueryData(usersQueryOptions);
  },
  component: Users,
});

function Users() {
  const { data: users } = useQuery(usersQueryOptions);
  return <div>{JSON.stringify(users)}</div>;
}
```

### With Route Tree Types

```tsx
// Auto-generated route tree provides full type safety
const { users } = Route.useLoaderData();
const { id } = Route.useParams();
```

---

## Route Protection

### Pattern: Protected Layout

```tsx
// routes/_authed.tsx
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    // Check auth
    const user = await getCurrentUser();

    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  return (
    <div>
      <header>Welcome {user.name}</header>
      <Outlet />
    </div>
  );
}
```

### Protected Child Routes

Any route under `_authed/` automatically inherits the protection:

```
routes/
├── _authed.tsx           # Protected layout with auth check
├── _authed/dashboard.tsx # /dashboard (protected)
└── _authed/users.tsx     # /users (protected)
```

---

## API Reference

### createFileRoute

```typescript
createFileRoute("/path")(options);
```

| Option       | Type            | Description                           |
| ------------ | --------------- | ------------------------------------- |
| `component`  | React Component | Page component                        |
| `loader`     | Function        | Server-side data loading              |
| `beforeLoad` | Function        | Runs before route loads, can redirect |

### Route Hooks

| Hook                      | Returns          | Usage                   |
| ------------------------- | ---------------- | ----------------------- |
| `Route.useParams()`       | `{ id: string }` | URL params              |
| `Route.useLoaderData()`   | `T`              | Loader return type      |
| `Route.useRouteContext()` | `{ user: User }` | Context from beforeLoad |

### createServerFn

```typescript
createServerFn({ method: "GET" | "POST" })
  .validator(schema)
  .handler(async ({ data }) => {});
```

---

## Next.js Comparison Summary

| Feature        | Next.js            | TanStack Start             |
| -------------- | ------------------ | -------------------------- |
| Routing        | App Router / Pages | File-based TanStack Router |
| Server Actions | `serverAction`     | `createServerFn`           |
| Data Fetching  | `fetch` + RQ       | TanStack Query in loaders  |
| Auth           | Middleware         | `beforeLoad` hook          |
| Type Safety    | Manual             | Auto-generated route tree  |
| SSR            | Built-in           | Client-first               |

---

## See Also

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Next.js Comparison](https://tanstack.com/start/docs/framework/react/comparison)
