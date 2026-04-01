# Learning Supabase with Next.js

## Introduction

Supabase is an open-source Firebase alternative providing a complete backend with PostgreSQL, authentication, real-time subscriptions, and more. This project demonstrates how to integrate Supabase with Next.js 15 using modern patterns.

## Key Concepts

### Supabase Client

Supabase provides different clients for different environments:

```typescript
// Browser client (client components)
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Server client (server components, API routes)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component - cookie setting is handled differently
          }
        },
      },
    },
  );
}
```

### Authentication

Supabase Auth provides email/password authentication out of the box:

```typescript
// Server Action for login
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(input: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
```

### Row Level Security (RLS)

PostgreSQL policies control data access:

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Real-time Subscriptions

Listen to database changes:

```typescript
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useTaskSubscription() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["tasks-subscription"],
    queryFn: () => {
      const supabase = createClient();

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

      return () => {
        supabase.removeChannel(channel);
      };
    },
    enabled: false,
  });
}
```

## Database Schema

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users access own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users access own subscriptions" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

## API Patterns

### Server Actions (Recommended)

Use Server Actions for mutations:

```typescript
// src/actions/tasks.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(input: { title: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({ user_id: user.id, title: input.title })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, task: data };
}
```

### React Query Integration

Use React Query for client-side data fetching with caching:

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
    staleTime: 60 * 1000, // Consider data stale after 1 minute
  });
}
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Best Practices

1. **Use Server Components** for initial data fetching
2. **Use React Query** for client-side caching and mutations
3. **Enable RLS** on all tables
4. **Use Server Actions** for form submissions
5. **Subscribe to real-time** changes only when needed (not by default)
6. **Validate inputs** with Zod on both client and server
7. **Revalidate paths** after mutations to update Server Components

## Common Issues

### Cookie Settings in Server Components

Server Components can't set cookies directly. Use the Supabase SSR cookie handling:

```typescript
// This pattern handles both Server Components and Route Handlers
cookies: {
  getAll() {
    return cookieStore.getAll();
  },
  setAll(cookiesToSet) {
    try {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options)
      );
    } catch {
      // Server Component context - cookies handled by middleware
    }
  },
}
```

### Real-time Subscription Memory Leaks

Always unsubscribe when component unmounts:

```typescript
useEffect(() => {
  const channel = supabase.channel("table Changes").subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Supabase in This Project

See the implementation in `src/lib/supabase/`:

- `client.ts` - Browser client for client components
- `server.ts` - Server client for server components
- `queries.ts` - Pre-built queries using React cache
- `types.ts` - TypeScript types for database schema

See the features:

- User authentication with email/password
- Task management with real-time updates
- Profile management
- Stripe subscription integration
