# Authentication Deep Dive

## Overview

This document explains the authentication patterns used in this Next.js + Supabase project.

## Supabase Auth Architecture

### Auth Flow

1. **User Registration**: Email + password stored in `auth.users`
2. **Session Creation**: JWT token generated, stored in httpOnly cookie
3. **Session Verification**: Middleware checks cookie on protected routes
4. **Data Access**: RLS policies use `auth.uid()` for authorization

### Cookie Handling

Supabase Auth uses cookies for session management:

```typescript
// Browser: Automatic cookie handling
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Cookies handled automatically in browser context
}

// Server: Manual cookie handling via SSR
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
          // Ignore in Server Components
        }
      },
    },
  });
}
```

## Server Actions for Auth

### Login

```typescript
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

### Registration

```typescript
export async function register(input: {
  email: string;
  password: string;
  fullName: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile in public.profiles table
  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: input.fullName,
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
```

### Logout

```typescript
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
```

## Middleware Route Protection

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register"];
const publicApiRoutes = ["/api/auth", "/api/health"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth cookies
  const hasAccessToken = request.cookies.get("sb-access-token");
  const hasSession = request.cookies.get("supabase-session");

  if (!hasAccessToken && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Protected Routes Pattern

### Server Component Protection

```typescript
// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header user={user} />
      <main>{children}</main>
    </div>
  );
}
```

### Client Component Protection

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
}
```

## Auth State Management

### Server Components with React.cache

```typescript
// src/lib/supabase/queries.ts
import { cache } from "react";
import { createClient } from "./server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});
```

### Client State with React Query

```typescript
// src/hooks/use-profile.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });
}
```

## Security Best Practices

### 1. Use httpOnly Cookies

Supabase handles this automatically for browser clients.

### 2. Enable Row Level Security (RLS)

```sql
-- All user data tables should have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users access own data" ON profiles
  FOR ALL USING (auth.uid() = id);
```

### 3. Validate on Server

Always validate authentication server-side:

```typescript
export async function getUserData() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  // Proceed with data fetching
}
```

### 4. Handle Token Expiration

```typescript
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
```

## Common Auth Patterns

### Profile Creation on Signup

```typescript
// Trigger or Server Action
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session?.user) {
    // Check if profile exists
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", session.user.id)
      .single();

    // Create profile if doesn't exist
    if (!data) {
      await supabase.from("profiles").insert({
        id: session.user.id,
        email: session.user.email,
      });
    }
  }
});
```

### Password Reset Flow

```typescript
// Request password reset
export async function requestPasswordReset(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  });
  return { error };
}
```

## Auth Callbacks

For OAuth providers or password reset:

```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```
