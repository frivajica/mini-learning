# Caching Strategies

## Overview

This project implements multiple caching strategies for optimal performance:

1. **React Query** - Client-side caching and request deduplication
2. **Next.js Cache** - Server-side caching with `cache()` and `revalidatePath()`
3. **Supabase Realtime** - Database change notifications

## React Query

### Setup

```typescript
// src/components/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Hooks

```typescript
// src/hooks/use-tasks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"], // Used for caching and invalidation
    queryFn: async () => {
      const supabase = createClient();
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      return tasks;
    },
    staleTime: 60 * 1000, // Consider fresh for 1 minute
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">,
    ) => {
      // Insert logic
    },
    onSuccess: () => {
      // Invalidate tasks query to refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
```

### Key Concepts

| Option                 | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `staleTime`            | Time before data is considered stale             |
| `cacheTime`            | Time before unused queries are garbage collected |
| `refetchOnWindowFocus` | Auto-refetch when user returns to tab            |
| `queryKey`             | Unique key for caching and invalidation          |

## Next.js Server Caching

### React.cache() for Memoization

```typescript
// src/lib/supabase/queries.ts
import { cache } from "react";
import { createClient } from "./server";

// cache() memoizes the result within a request
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Multiple calls in same request return cached value
const user = await getUser(); // First call - fetches
const session = await getSession(); // Different function
const userAgain = await getUser(); // Cached - no fetch
```

### Revalidation

```typescript
// After mutations, revalidate to trigger fresh fetches
import { revalidatePath } from "next/cache";

export async function createTask(input: TaskInput) {
  const supabase = await createClient();
  await supabase.from("tasks").insert(input);

  // Invalidate all routes that show tasks
  revalidatePath("/dashboard");

  return { success: true };
}
```

### Route Groups

```typescript
// app/(dashboard)/layout.tsx - Layout for all dashboard routes
// Changes to /dashboard will also affect /dashboard/settings
// because they share the same layout segment
```

## Real-time Caching

### Supabase Realtime

```typescript
// src/hooks/use-tasks.ts
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
            // Invalidate React Query cache on changes
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          },
        )
        .subscribe();

      // Return cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    },
    enabled: false, // Don't auto-start subscription
  });
}
```

### Usage in Component

```typescript
export default function DashboardPage() {
  const subscribe = useTaskSubscription();

  const enableRealtime = () => {
    subscribe.data?.(); // Start subscription
  };

  return (
    <div>
      <Button onClick={enableRealtime}>Enable Real-time</Button>
      {/* ... */}
    </div>
  );
}
```

## Caching Decision Matrix

| Scenario          | Strategy                                     |
| ----------------- | -------------------------------------------- |
| Initial page load | Server Components + `cache()`                |
| User interactions | React Query mutations + `revalidatePath()`   |
| Real-time updates | Supabase Realtime + React Query invalidation |
| Form submissions  | Server Actions + React Query                 |
| Static data       | Next.js static generation                    |

## Performance Tips

### 1. Batch Requests

```typescript
// Bad: Sequential fetches
const user = await getUser();
const tasks = await getTasks();

// Good: Parallel fetches
const [user, tasks] = await Promise.all([getUser(), getTasks()]);
```

### 2. Use React.cache() for Repeated Calls

```typescript
// Without cache - each call fetches
export async function getUser() {
  /* fetches */
}

// With cache - first call cached for request
export const getUser = cache(async () => {
  /* fetches */
});
```

### 3. Invalidate Precisely

```typescript
// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });

// Invalidate all under prefix
queryClient.invalidateQueries({ queryKey: ["tasks"] });
```

### 4. Handle Loading States

```typescript
const { data: tasks, isLoading, isError } = useTasks();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage />;
return <TaskList tasks={tasks} />;
```

## Debugging Cache Issues

### React Query DevTools

```typescript
// Add to root layout
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  );
}
```

### Check Cache Status

```typescript
const queryClient = useQueryClient();

// Log all cached data
console.log(queryClient.getQueryData(["tasks"]));

// Check if query is fresh
console.log(queryClient.isStale(["tasks"]));
```
