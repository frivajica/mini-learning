# Authentication Guide

## JWT Authentication Flow

This project implements a two-token authentication system with HTTP-only cookies for enhanced security.

### Tokens

| Token         | Lifetime   | Storage          | Purpose               |
| ------------- | ---------- | ---------------- | --------------------- |
| Access Token  | 15 minutes | Memory (client)  | API authentication    |
| Refresh Token | 7 days     | HTTP-only cookie | Get new access tokens |

### Registration Flow

```
Client                    Server
  |                          |
  |-- POST /auth/register -->|
  |   {email, name, password} |
  |                          |
  |<- 200 OK ----------------|
  |   {user, accessToken,   |
  |    refreshToken (cookie)}|
```

### Login Flow

```
Client                    Server
  |                          |
  |-- POST /auth/login ----->|
  |   {email, password}       |
  |                          |
  |<- 200 OK ----------------|
  |   {user, accessToken,   |
  |    refreshToken (cookie)}|
```

### Authenticated Request

```
Client                    Server
  |                          |
  |-- GET /products -------->|
  |   Authorization: Bearer  |
  |   <access_token>          |
  |                          |
  |<- 200 OK ----------------|
```

### Token Refresh Flow

```
Client                    Server
  |                          |
  |-- POST /auth/refresh --->|
  |   (cookie sent auto)      |
  |                          |
  |<- 200 OK ----------------|
  |   {accessToken,          |
  |    refreshToken}         |
```

## Security Features

### HTTP-Only Cookies

Refresh tokens are stored in HTTP-only cookies, preventing JavaScript access:

```typescript
res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### Password Hashing

Passwords are hashed with bcrypt (12 rounds):

```typescript
const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);
```

### JWT Secret Requirements

- Access token secret: minimum 32 characters
- Refresh token secret: minimum 32 characters
- Different secrets for each token type
- Never commit secrets to version control

## Protected Routes

Routes requiring authentication use the `authenticate` middleware:

```typescript
router.put("/:id", authenticate, asyncHandler(productController.updateProduct));
```

The middleware:

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature and expiration
3. Attaches user info to `req.user`
4. Returns 401 if token is missing or invalid

## Environment Variables

```
JWT_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```
