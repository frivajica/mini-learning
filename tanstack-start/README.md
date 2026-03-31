# TanStack Start Mini Project

Production-ready TanStack Start reference implementation for learning full-stack React with type-safe routing.

## TL;DR

- **What**: TanStack Start + TanStack Router + TanStack Query
- **Why**: Type-safe full-stack React framework with file-based routing
- **Stack**: React 19, TanStack Start, TanStack Query, Zod, jose, bcrypt
- **Run**: `yarn install && yarn dev`

## Quick Start

```bash
# Install dependencies
cd tanstack-start && yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Type check
yarn typecheck
```

## Features

- **File-based routing** with TanStack Router
- **Type-safe routes** - auto-generated route tree
- **Server functions** - type-safe API endpoints
- **TanStack Query** - data fetching and caching
- **JWT Authentication** with httpOnly cookies
- **Protected routes** - auth via beforeLoad hook
- **Zod validation** - runtime type checking
- **Minimal UI** - clean shadcn-inspired components

## Tech Stack

| Layer         | Technology      | Why                        |
| ------------- | --------------- | -------------------------- |
| Framework     | TanStack Start  | Type-safe full-stack React |
| Routing       | TanStack Router | File-based + type-safe     |
| Data Fetching | TanStack Query  | Caching, invalidation      |
| Validation    | Zod             | Runtime schema validation  |
| Auth          | jose            | JWT in httpOnly cookies    |
| Styling       | Tailwind        | Utility-first CSS          |

## Project Structure

```
src/
├── routes/                 # File-based routes
│   ├── index.tsx         # Home (public)
│   ├── login.tsx         # Login (public)
│   ├── register.tsx       # Register (public)
│   ├── _authed.tsx       # Protected layout
│   ├── _authed/dashboard.tsx
│   └── _authed/users.tsx
├── components/ui/          # UI components
├── hooks/                 # React hooks
├── utils/                # Utilities
├── server/               # Server-side code
│   ├── auth.ts           # JWT auth functions
│   └── db.ts            # Mock database
└── router.tsx           # Router configuration
```

## API Endpoints

| Method | Endpoint           | Description      | Auth   |
| ------ | ------------------ | ---------------- | ------ |
| POST   | /api/auth/login    | Login            | Public |
| POST   | /api/auth/register | Register         | Public |
| POST   | /api/auth/logout   | Logout           | Public |
| GET    | /api/auth/me       | Get current user | Auth   |
| GET    | /api/users         | List users       | Auth   |

## Auth Flow

```
1. POST /api/auth/login → Returns JWT in httpOnly cookie
2. Access protected routes → Cookie sent automatically
3. Logout → POST /api/auth/logout → Clears cookie
```

## Environment Variables

| Variable   | Default       | Description        |
| ---------- | ------------- | ------------------ |
| JWT_SECRET | (dev default) | JWT signing secret |

## Documentation

- [LEARN.md](LEARN.md) - Learning guide with Next.js comparison
- [AUTH_INFO.md](AUTH_INFO.md) - Auth deep-dive
