# Authentication Deep-Dive

Understanding the authentication implementation in this Payload CMS project.

---

## Table of Contents

1. [Authentication Architecture](#authentication-architecture)
2. [Built-in Auth vs OAuth](#built-in-auth-vs-oauth)
3. [User Roles and Access Control](#user-roles-and-access-control)
4. [Login Flow](#login-flow)
5. [Session Management](#session-management)
6. [Google OAuth Setup](#google-oauth-setup)
7. [Common Pitfalls](#common-pitfalls)
8. [Debugging Auth Issues](#debugging-auth-issues)

---

## Authentication Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js UI  │────▶│  Payload CMS    │
│             │◀────│              │◀────│  (Auth Handler) │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │    Database     │
                                         │   (Users Coll.)  │
                                         └─────────────────┘
```

---

## Built-in Auth vs OAuth

### Built-in Email/Password

**Pros:**

- Zero configuration
- Works offline
- Complete control over user data
- No external dependencies

**Cons:**

- Users need to remember another password
- Password reset flow must be implemented
- Security responsibility falls on you

### Google OAuth

**Pros:**

- No new passwords for users
- Google's security is excellent
- Reduced friction = higher conversion

**Cons:**

- Requires Google Cloud setup
- Requires internet connection
- Dependent on Google's availability

### Recommendation

Use **both**:

- Built-in auth for flexibility and offline support
- Google OAuth for user convenience

---

## User Roles and Access Control

### Role Types

| Role    | Description                 | Use Case        |
| ------- | --------------------------- | --------------- |
| `user`  | Standard authenticated user | Content authors |
| `admin` | Full access to everything   | Administrators  |

### Defining Roles in Payload

```typescript
const users = {
  slug: "users",
  auth: true,
  fields: [
    {
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
      defaultValue: "user",
      required: true,
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
  ],
};
```

### Access Control Examples

**Posts - Read Access:**

```typescript
read: ({ req: { user }, doc }) => {
  if (user?.role === "admin") return true;
  if (doc?.status === "published") return true;
  if (user && doc?.author === user.id) return true;
  return false;
},
```

**Posts - Write Access:**

```typescript
update: ({ req: { user }, doc }) => {
  if (user?.role === "admin") return true;
  return doc?.author === user?.id;
},
```

**Categories - Admin Only:**

```typescript
access: {
  read: () => true, // Public read
  create: ({ req: { user } }) => user?.role === "admin",
  update: ({ req: { user } }) => user?.role === "admin",
  delete: ({ req: { user } }) => user?.role === "admin",
},
```

---

## Login Flow

### Standard Login

```
Browser                    Payload                    Database
  │                           │                           │
  │──POST /api/users/login───▶│                           │
  │   {email, password}      │                           │
  │                           │──Verify credentials──────▶│
  │                           │◀──User found──────────────│
  │                           │                           │
  │◀──200 {user, token}──────│                           │
```

### Implementation

```typescript
// In your frontend
const handleLogin = async (email: string, password: string) => {
  const response = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const { user, token } = await response.json();
    // Store token, redirect user
  }
};
```

---

## Session Management

### Token-Based Sessions

Payload uses JWT tokens for authentication:

```
Token Structure:
┌─────────────────────────────────────────────┐
│  Header: { alg: "HS256", typ: "JWT" }       │
├─────────────────────────────────────────────┤
│  Payload:                                   │
│  {                                          │
│    "sub": "user-id",                        │
│    "email": "user@example.com",             │
│    "role": "admin",                         │
│    "exp": 1234567890                        │
│  }                                          │
├─────────────────────────────────────────────┤
│  Signature: HMAC(SHA256)                    │
└─────────────────────────────────────────────┘
```

### Token Storage

| Storage              | Pros                       | Cons                 |
| -------------------- | -------------------------- | -------------------- |
| localStorage         | Easy, persists across tabs | XSS vulnerable       |
| httpOnly Cookie      | XSS safe                   | CSRF vulnerable      |
| Memory (React state) | XSS safe                   | Lost on page refresh |

**Recommendation:** Use httpOnly cookies for production, with CSRF protection.

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials

### Step 2: Configure Redirect URI

Add to your OAuth credentials:

```
http://localhost:3000/oauth/callback/google
```

### Step 3: Add Environment Variables

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 4: Payload Configuration

```typescript
// payload.config.ts
import { googleOauthPlugin } from "@payloadcms/auth-google";

export default buildConfig({
  // ...
  plugins: [
    googleOauthPlugin({
      credentials: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      populate: {
        filename: "avatar", // Auto-populate avatar field
      },
    }),
  ],
});
```

### Google OAuth Flow

```
Browser              Google              Payload              User
   │                   │                    │                  │
   │──▶ Login with     │                    │                  │
   │    Google         │                    │                  │
   │◀──────────────────│                    │                  │
   │   (auth code)     │                    │                  │
   │                   │                    │                  │
   │──Exchange code───▶│                    │                  │
   │                   │──Verify───────────▶│                  │
   │                   │◀──User info────────│                  │
   │                   │                    │──Create user────▶│
   │                   │                    │◀──Token──────────│
   │◀──Redirect to app │                    │                  │
```

---

## Common Pitfalls

### 1. Not Checking User Before Operations

**Problem:** Operations assume a user exists.

```typescript
// Wrong - user might be undefined
const isAdmin = user.role === "admin";

// Correct - use optional chaining
const isAdmin = user?.role === "admin";
```

### 2. Trusting Client-Side Role Check

**Problem:** Client can spoof role in requests.

```typescript
// Wrong - trust client-provided role
if (data.role === "admin") { ... }

// Correct - check server-side user
if (req.user?.role === "admin") { ... }
```

### 3. Exposing Sensitive Fields

**Problem:** Password or sensitive data returned to client.

```typescript
// Wrong - exposes password
findByID({
  collection: "users",
  id: userId,
});

// Correct - use select to exclude sensitive fields
findByID({
  collection: "users",
  id: userId,
  select: {
    email: true,
    name: true,
    role: true,
  },
});
```

### 4. Not Validating Token Expiry

**Problem:** Expired tokens accepted.

**Solution:** Payload handles this automatically with JWT.

---

## Debugging Auth Issues

### "User is not authenticated"

```
Check:
1. Token present in request header?
2. Token expired? (check jwt.io)
3. Token signature valid? (check PAYLOAD_SECRET_KEY)
4. User exists in database?
```

### "Access denied"

```
Check:
1. User has required role?
2. User is the resource owner?
3. Access control function logic correct?
```

### "OAuth callback failed"

```
Check:
1. GOOGLE_CLIENT_ID correct?
2. Redirect URI matches Google Console?
3. Client secret correct?
4. OAuth enabled in Payload config?
```

---

## See Also

- [Payload Auth Documentation](https://payloadcms.com/docs/authentication/overview)
- [JWT Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [LEARN.md](LEARN.md)
