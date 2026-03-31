# Authentication Guide

Quick summary for implementation:
1. Use **JWT** (not sessions) for REST APIs
2. Store access token in **memory**, refresh token in **httpOnly cookie**
3. Keep users logged in with refresh tokens

---

## TL;DR - What to Use

| Token | Where to Store | Lifetime |
|-------|----------------|----------|
| Access Token | Memory (JavaScript variable) | 15 minutes |
| Refresh Token | httpOnly Cookie | 7 days |

**Why:** Secure (XSS-proof), works across reloads, scales well.

---

## How It Works (Quick)

```
Login → Get accessToken + refreshToken
API Calls → Send accessToken in header (Authorization: Bearer ...)
Page Reload → Call /auth/refresh → Get new accessToken
Token Expired → Automatic refresh via refreshToken
```

---

## Token Storage Options

### Recommended: Hybrid Approach

```
Access Token → JavaScript memory (variable)
Refresh Token → httpOnly cookie
```

- Access token: Used in API requests, lost on reload (that's fine - we refresh!)
- Refresh token: Survives reloads, XSS-proof

### Less Secure Alternatives

| Storage | Why Not |
|---------|---------|
| localStorage | XSS can steal it |
| Regular cookie | XSS can read it |
| Session (server) | Harder to scale |

---

## Refresh Tokens Explained

```
1. Login
   → Server: accessToken (15 min) + refreshToken (7 days)

2. API Request
   → Header: Authorization: Bearer <accessToken>
   → Success!

3. Access Token Expires (15 min)
   → Next request → 401 Unauthorized

4. Auto-Refresh
   → Frontend calls /auth/refresh (sends refreshToken cookie)
   → Server: NEW accessToken + NEW refreshToken

5. Retry Request
   → Now it works!
```

---

## Security: XSS & CSRF

### XSS (Cross-Site Scripting)
Attacker injects malicious code → steals your tokens

**Prevention:**
- httpOnly cookies (JS can't read)
- Sanitize user input
- Content Security Policy

### CSRF (Cross-Site Request Forgery)
Attacker tricks browser → makes request using your cookies

**Prevention:**
- SameSite cookies
- CSRF tokens

**Important:** httpOnly cookies stop XSS but NOT CSRF. Need both!

---

## JWT vs Sessions

| Aspect | JWT | Sessions |
|--------|-----|----------|
| Storage | Client (token) | Server (database) |
| Stateless | ✅ Yes | ❌ No |
| Scalability | Easy | Harder |
| Revocation | Harder | Easy |

**When JWT:** APIs, SPAs, mobile apps
**When Sessions:** Traditional web apps, sensitive apps

---

## This Project

- Access token → Authorization header (`Bearer ...`)
- Refresh token → Header or cookie
- Both stored in database (can revoke if needed)

---

## How Big Companies Do It (Facebook, etc.)

They use **multiple layers**:
- Multiple token types with different lifetimes
- Device fingerprinting (track device/location/IP)
- Risk-based auth (suspicious activity → re-login)
- Server-side sessions (instant revocation)

**For your app:** The hybrid approach above is secure enough!

---

## Detailed: Token Storage Methods

### HTTP Header (Bearer Token)
```javascript
// Frontend
fetch('/api/users', {
  headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...' }
})
```

### Cookies
```javascript
// Server sets
res.cookie('token', token, { httpOnly: true, secure: true })
```

### Comparison

| Method | Pros | Cons |
|--------|------|------|
| Header | Full control | Manual |
| httpOnly Cookie | Auto, XSS-safe | CSRF risk |
| localStorage | Easy | XSS risk |

---

## Detailed: JWT Concept

**Stateless:** Server doesn't store user info. Token contains all needed info.

| | Session | JWT |
|--|---------|-----|
| Analogy | "I'll remember you" | "Here's your ID card" |
| Storage | Server database | Inside the token |

---

## Detailed: Attacks

### XSS Types
- **Stored** - In database, affects everyone
- **Reflected** - In URL
- **DOM** - Client-side only

### CSRF Flow
1. You're logged into bank
2. Visit attacker's site (other tab)
3. Attacker's page sends request to bank
4. Browser includes your cookies automatically
5. Bank thinks it's you
