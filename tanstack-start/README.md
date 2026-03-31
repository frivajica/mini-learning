# TanStack Start Mini Project

Production-ready TanStack Start reference implementation for learning full-stack React with type-safe routing.

## TL;DR

- **What**: TanStack Start + TanStack Router
- **Why**: Type-safe full-stack React framework with file-based routing
- **Stack**: React 19, TanStack Start, SQLite, bcrypt, jose, Zod
- **Run**: `yarn install && yarn dev`

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Type check
yarn typecheck

# Run tests
yarn test
```

## Features

- **File-based routing** with TanStack Router
- **Type-safe routes** - auto-generated route tree
- **Server functions** - type-safe API endpoints
- **SQLite database** - persistent storage with better-sqlite3
- **JWT Authentication** with httpOnly cookies
- **Rate limiting** - 5 login attempts per 5 minutes per IP
- **Protected routes** - auth via beforeLoad hook
- **Zod validation** - runtime type checking
- **bcrypt password hashing** - cost factor 12
- **Minimal UI** - clean shadcn-inspired components

## Tech Stack

| Layer      | Technology      | Why                              |
| ---------- | --------------- | -------------------------------- |
| Framework  | TanStack Start  | Type-safe full-stack React       |
| Routing    | TanStack Router | File-based + type-safe           |
| Database   | SQLite          | Persistent, zero-config storage  |
| Validation | Zod             | Runtime schema validation        |
| Auth       | jose + bcrypt   | JWT + password hashing           |
| Rate Limit | Custom          | In-memory, per-IP sliding window |
| Styling    | Tailwind        | Utility-first CSS                |

## Project Structure

```
src/
├── routes/                    # File-based routes
│   ├── index.tsx              # Home (public)
│   ├── login.tsx              # Login (public)
│   ├── register.tsx           # Register (public)
│   ├── _authed.tsx            # Protected layout
│   ├── _authed/dashboard.tsx  # Dashboard
│   ├── _authed/users.tsx      # Users list
│   ├── api/auth/-login.ts     # Auth API (login, register, logout, me)
│   └── api/users/-index.ts    # Users API
│   └── api/health.ts          # Health check
├── components/ui/              # UI components
├── hooks/                     # React hooks
├── utils/                     # Utilities (Zod schemas)
├── server/                    # Server-side code
│   ├── auth.ts               # JWT + bcrypt functions
│   ├── db.ts                # SQLite database layer
│   └── rate-limit.ts        # Rate limiting
└── router.tsx                # Router configuration
```

## API Endpoints

| Method | Endpoint           | Description      | Auth   | Rate Limited |
| ------ | ------------------ | ---------------- | ------ | ------------ |
| POST   | /api/auth/login    | Login            | Public | Yes (5/min)  |
| POST   | /api/auth/register | Register         | Public | Yes (5/min)  |
| POST   | /api/auth/logout   | Logout           | Public | No           |
| GET    | /api/auth/me       | Get current user | Auth   | No           |
| GET    | /api/users         | List users       | Auth   | No           |
| GET    | /api/health        | Health check     | Public | No           |

## Auth Flow

```
1. POST /api/auth/register → Hash password with bcrypt → Store in SQLite
2. POST /api/auth/login → Validate credentials → Create JWT + refresh token
3. Refresh token stored in httpOnly cookie (7 day expiry)
4. Access protected routes → Cookie sent automatically
5. Logout → POST /api/auth/logout → Delete refresh token
```

## Security Features

- **Passwords**: bcrypt with cost factor 12
- **JWT**: HS256, 15 minute expiry
- **Refresh tokens**: Rotated on login, stored in SQLite
- **Rate limiting**: 5 attempts per 5 minutes per IP on login/register
- **Cookies**: HttpOnly, SameSite=Lax, Secure in production

## Environment Variables

| Variable   | Default             | Description        |
| ---------- | ------------------- | ------------------ |
| JWT_SECRET | (dev warning shown) | JWT signing secret |
| DB_PATH    | ./data/mini.db      | SQLite file path   |
| NODE_ENV   | development         | Environment mode   |

## Test Users

| Email             | Password    | Role  |
| ----------------- | ----------- | ----- |
| admin@example.com | Password123 | ADMIN |
| user@example.com  | Password123 | USER  |

## Documentation

- [LEARN.md](LEARN.md) - Learning guide with Next.js comparison
- [AUTH_INFO.md](AUTH_INFO.md) - Auth deep-dive
