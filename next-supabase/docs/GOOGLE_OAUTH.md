# Google OAuth Setup

## Overview

This project supports Google OAuth alongside email/password authentication. This guide explains how to configure Google OAuth for Supabase.

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User    │────▶│  Next.js   │────▶│   Google   │
│  clicks   │     │   Login    │     │    OAuth   │
└─────────────┘     └─────────────┘     └─────────────┘
                                            │
                                            ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Callback   │◀────│   Google    │
                    │   Route    │     │  redirects  │
                    └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Supabase  │
                    │  Auth      │
                    │  creates   │
                    │  session   │
                    └─────────────┘
```

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Note your Project ID

### 2. Enable Google+ API

1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External**
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (for development)
6. Click **Save**

### 4. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `Supabase OAuth`
5. Authorized redirect URIs:
   ```
   http://localhost:54321/auth/v1/callback
   https://your-production-domain.com/auth/v1/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### 5. Configure Supabase (GoTrue)

Set these environment variables in `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

In `docker-compose.yml`, the auth service already has:

```yaml
auth:
  environment:
    GOTRUE_OAUTH_VAULT_GOOGLE: "true"
    GOTRUE_OAUTH_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOTRUE_OAUTH_GOOGLE_SECRET: ${GOOGLE_CLIENT_SECRET}
```

### 6. Restart Services

```bash
docker-compose down
docker-compose up -d auth
```

## Testing Locally

1. Start the application:

   ```bash
   yarn dev
   ```

2. Go to `http://localhost:3000/login`

3. Click "Sign in with Google"

4. You should be redirected to Google's consent screen

5. After approval, you're redirected back to the dashboard

## Production Configuration

### Update Authorized URIs

In Google Cloud Console, add your production callback URL:

```
https://your-production-domain.com/auth/v1/callback
```

### Update Environment Variables

Set production values:

```env
GOTRUE_OAUTH_GOOGLE_CLIENT_ID=production-client-id
GOTRUE_OAUTH_GOOGLE_SECRET=production-client-secret
```

## Code Implementation

### Server Action (`src/actions/oauth.ts`)

```typescript
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
```

### Callback Route (`src/app/api/auth/callback/route.ts`)

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create or update profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        avatar_url: data.user.user_metadata?.avatar_url,
      });
    }
  }

  redirect(`${origin}${next}`);
}
```

## Troubleshooting

### "redirect_uri_mismatch" Error

**Cause**: Callback URL not configured in Google Cloud Console

**Fix**: Add the exact callback URL in Google Cloud Console:

- For local: `http://localhost:54321/auth/v1/callback`
- For production: `https://your-domain.com/auth/v1/callback`

### "OAuth provider not enabled" Error

**Cause**: Google OAuth not enabled in Supabase

**Fix**: Ensure environment variables are set and restart auth service:

```bash
docker-compose restart auth
```

### User Profile Not Created

**Cause**: Profile creation handled in callback

**Fix**: Check browser console for errors and verify Supabase connection works.

## Security Considerations

1. **Redirect URIs**: Only allow your production domain in Google Console
2. **Scopes**: Only request necessary scopes (email, profile)
3. **Test Users**: Remove test users before production launch
4. **Cookie Security**: Supabase handles httpOnly cookies automatically

## Related Documentation

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google Cloud OAuth](https://developers.google.com/workspace/guides/create-credentials)
- [OAuth 2.0](https://oauth.net/2/)
