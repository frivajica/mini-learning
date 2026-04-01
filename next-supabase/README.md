# Mini Next Supabase

![Test](https://github.com/your-org/next-supabase/actions/workflows/test.yml/badge.svg)
![Deploy](https://github.com/your-org/next-supabase/actions/workflows/deploy.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A production-ready reference implementation for learning Supabase patterns with Next.js 15. Featuring authentication, real-time subscriptions, React Query caching, and Stripe subscriptions.

## Features

- **Supabase Auth** - Email/password + Google OAuth with httpOnly cookies
- **Real-time Subscriptions** - Live task updates with Supabase Realtime
- **React Query** - Client-side caching and optimistic updates
- **Stripe Subscriptions** - Monthly subscription payments
- **Kong Rate Limiting** - Redis-backed API rate limiting
- **Self-hosted Sentry** - Error tracking and monitoring
- **Next.js 15 App Router** - Server Components, Server Actions, Middleware
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Testing** - Vitest (unit/component) + Playwright (E2E)
- **CI/CD** - GitHub Actions with lint, typecheck, test, and build pipelines

## Tech Stack

| Category     | Technology              |
| ------------ | ----------------------- |
| Framework    | Next.js 15 (App Router) |
| Database     | Supabase PostgreSQL     |
| Auth         | Supabase Auth           |
| Real-time    | Supabase Realtime       |
| Client Cache | React Query             |
| Payments     | Stripe                  |
| API Gateway  | Kong (Rate Limiting)    |
| Monitoring   | Self-hosted Sentry      |
| Validation   | Zod                     |
| Styling      | Tailwind CSS            |
| Testing      | Vitest + Playwright     |
| CI/CD        | GitHub Actions          |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Stripe account (for subscriptions)

### Setup

1. **Install dependencies:**

```bash
cd next-supabase
yarn install
```

2. **Set up Supabase:**

```bash
# Start Supabase services
docker-compose up -d

# Create tables (run in Supabase SQL editor)
# See docs/LEARN.md for SQL schema
```

3. **Configure environment:**

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Start development:**

```bash
yarn dev
```

5. **Open http://localhost:3000**

## Project Structure

```
next-supabase/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes (webhooks)
│   ├── actions/               # Server Actions
│   ├── components/            # React components
│   │   ├── ui/               # UI primitives (Button, Input, Card)
│   │   └── providers/         # Context providers
│   ├── hooks/                 # React Query hooks
│   └── lib/
│       ├── supabase/          # Supabase client & types
│       ├── stripe.ts          # Stripe client
│       ├── validations.ts     # Zod schemas
│       └── utils.ts           # Utility functions
├── docs/                      # Learning documentation
├── docker-compose.yml         # Supabase + Redis
├── package.json
└── README.md
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Sentry (Self-hosted)
SENTRY_DSN=https://your-sentry-dsn@sentry.example.com/your-project
SENTRY_SECRET_KEY=your_sentry_secret_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Learning Path

1. **[LEARN.md](docs/LEARN.md)** - Supabase patterns and concepts
2. **[AUTH_INFO.md](docs/AUTH_INFO.md)** - Authentication deep dive
3. **[GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md)** - Google OAuth setup
4. **[CACHING.md](docs/CACHING.md)** - Caching strategies
5. **[STRIPE.md](docs/STRIPE.md)** - Stripe subscription integration
6. **[KONG.md](docs/KONG.md)** - Kong API Gateway and rate limiting
7. **[TESTING.md](docs/TESTING.md)** - Testing strategies (Vitest + Playwright)
8. **[INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md)** - Docker architecture
9. **[PRODUCTION.md](docs/PRODUCTION.md)** - Production deployment

## Key Patterns

### Server Actions

```typescript
// src/actions/tasks.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(input: { title: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title: input.title })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true, task: data };
}
```

### React Query Hooks

```typescript
// src/hooks/use-tasks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return tasks;
    },
    staleTime: 60 * 1000,
  });
}
```

### Real-time Subscriptions

```typescript
const channel = supabase
  .channel("tasks-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "tasks" },
    () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  )
  .subscribe();
```

## Documentation

| File                                             | Description                           |
| ------------------------------------------------ | ------------------------------------- |
| [docs/LEARN.md](docs/LEARN.md)                   | Supabase patterns and database design |
| [docs/AUTH_INFO.md](docs/AUTH_INFO.md)           | Authentication architecture           |
| [docs/CACHING.md](docs/CACHING.md)               | React Query and caching strategies    |
| [docs/STRIPE.md](docs/STRIPE.md)                 | Stripe subscription integration       |
| [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md)     | Google OAuth setup guide              |
| [docs/KONG.md](docs/KONG.md)                     | Kong API Gateway and rate limiting    |
| [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) | Docker architecture                   |
| [docs/PRODUCTION.md](docs/PRODUCTION.md)         | Production deployment guide           |
| [docs/TESTING.md](docs/TESTING.md)               | Testing strategy and examples         |

## Scripts

```bash
# Development
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
yarn typecheck    # Run TypeScript checks

# Testing
yarn test         # Run unit and component tests (Vitest)
yarn test:e2e     # Run end-to-end tests (Playwright)
yarn test:e2e:ui # Run E2E tests with UI
yarn test:watch   # Run tests in watch mode
```
