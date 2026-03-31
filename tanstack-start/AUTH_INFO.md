# Authentication Deep-Dive

Understanding the auth implementation in TanStack Start.

## Token Flow

### Login Flow

```
┌─────────┐                           ┌──────────────┐                    ┌────────────┐
│  Client │                           │  Server Fn   │                    │    DB      │
└────┬─────┘                           └──────┬───────┘                    └─────┬──────┘
     │                                      │                                  │
     │──loginFn({email, password})──────────>│                                  │
     │                                      │──validateUser──────────────────────>│
     │                                      │<──user found───────────────────────│
     │                                      │                                  │
     │                                      │──createAccessToken()              │
     │                                      │──createRefreshToken()────────────>│
     │                                      │                                  │
     │<──{user, Set-Cookie}────────────────│                                  │
```

### Protected Route Access

```
┌─────────┐                           ┌──────────────┐
│  Client │                           │  beforeLoad  │
└────┬─────┘                           └──────┬───────┘
     │                                      │
     │──GET /dashboard───────────────────────>│
     │                                      │
     │                                      │──check refresh_token cookie
     │                                      │──validate token
     │                                      │──return user or redirect
     │                                      │
     │<──{page with user context}───────────│
```

---

## Security Considerations

### JWT Storage

| Storage         | XSS Risk      | CSRF Risk           | Recommendation  |
| --------------- | ------------- | ------------------- | --------------- |
| localStorage    | ❌ Vulnerable | ✅ Safe             | Not recommended |
| httpOnly Cookie | ✅ Safe       | ⚠️ Needs protection | **Recommended** |

### Why httpOnly Cookies?

```typescript
// Server sets cookie as httpOnly
response.headers.set(
  "Set-Cookie",
  `refresh_token=${token}; HttpOnly; SameSite=Lax; Path=/`,
);
```

Benefits:

- JavaScript cannot access the token (XSS safe)
- Sent automatically with every request
- SameSite=Lax prevents CSRF on GET requests

### CSRF Protection

For state-changing operations (POST/PUT/DELETE), TanStack Start uses:

1. **SameSite=Lax cookie** - Browser only sends cookie on same-site requests
2. **Double-submit pattern** - Can be added for extra security

---

## Cookie Configuration

```typescript
const cookieOptions = {
  httpOnly: true, // Cannot be accessed by JS
  secure: true, // Only sent over HTTPS
  sameSite: "lax", // Sent on same-site requests
  path: "/", // Available on all paths
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
```

---

## Token Rotation

Every login/refresh generates a **new** refresh token:

```typescript
// Old token is invalidated when new one is created
export const refreshFn = createServerFn({ method: "POST" }).handler(
  async ({ data }) => {
    // Verify old token
    const oldToken = db.refreshTokens.findByToken(data.refreshToken);

    // Revoke old token
    db.refreshTokens.revoke(data.refreshToken);

    // Create new tokens
    const newRefreshToken = db.refreshTokens.create(user.id);
    const accessToken = await createAccessToken(user);

    return { accessToken, refreshToken: newRefreshToken.token };
  },
);
```

---

## Common Pitfalls

### 1. Forgetting credentials

**Problem**: Tokens work but user data stale.

**Fix**: Always verify token validity server-side.

### 2. Cookie Not Sent

**Problem**: Request works in browser but not in fetch.

**Fix**: Include `credentials: 'include'` in fetch:

```typescript
fetch("/api/users", {
  credentials: "include", // Send cookies
});
```

### 3. Redirect in Server Function

**Problem**: Server function returns data but client expects redirect.

**Fix**: Use `throw redirect()` in `beforeLoad`, not in server function:

```typescript
// CORRECT: redirect in beforeLoad
beforeLoad: async () => {
  if (!user) throw redirect({ to: "/login" });
};

// WRONG: trying to redirect from server function
handler: async () => {
  throw redirect({ to: "/login" }); // This won't work!
};
```

---

## Debugging Auth Issues

### Cookie Not Set

```typescript
// Check response headers
const response = await loginFn({ data });
console.log(response.headers.get("Set-Cookie"));
```

### Token Invalid

```typescript
// Verify token format
const payload = await verifyAccessToken(token);
if (!payload) {
  throw new Error("Invalid token");
}
```

### User Not Loading

```typescript
// Check if cookie is being sent
const cookies = document.cookie;
console.log(cookies); // Should contain refresh_token
```

---

## See Also

- [TanStack Start Auth Guide](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
