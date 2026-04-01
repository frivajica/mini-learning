# Mini Payload CMS

A production-ready reference implementation for learning Payload CMS with Next.js 16. Featuring collections, access control, authentication, and file storage.

## TL;DR

- **What**: Self-hosted headless CMS with Next.js frontend
- **Why**: Learn Payload CMS patterns for content-heavy applications
- **Stack**: Next.js 16 + Payload CMS 3 + SQLite (dev) / PostgreSQL (prod)
- **Run**: `yarn install && yarn dev` (see Quick Start below)

---

## Quick Start

```bash
# 1. Clone and enter
git clone <repo> && cd payload

# 2. Install dependencies
yarn install

# 3. Start development server
yarn dev

# 4. Open http://localhost:3000/admin
```

---

## Features

- ✅ **Collections**: Posts, Categories, Tags, Media with relationships
- ✅ **Access Control**: Public/authenticated/admin roles
- ✅ **Draft/Publish**: Content workflow with status management
- ✅ **Authentication**: Email/password + Google OAuth
- ✅ **File Storage**: Local filesystem + S3-compatible pattern
- ✅ **Admin UI**: Customized Payload admin panel
- ✅ **TypeScript**: Full type safety with generated types

---

## Tech Stack

| Layer     | Technology          | Why                           |
| --------- | ------------------- | ----------------------------- |
| Framework | Next.js 16          | App Router, Server Components |
| Language  | TypeScript 5.1+     | Type safety                   |
| CMS       | Payload CMS 3.x     | Self-hosted, TypeScript-first |
| Database  | SQLite (dev)        | Zero-config development       |
| Database  | PostgreSQL (prod)   | Production-grade reliability  |
| Auth      | Payload built-in    | Email/password + OAuth        |
| Storage   | Local filesystem    | Development simplicity        |
| Styling   | Tailwind CSS        | Utility-first                 |
| Testing   | Vitest + Playwright | Unit and E2E testing          |

---

## Project Structure

```
payload/
├── src/
│   ├── app/
│   │   ├── (app)/              # Public frontend
│   │   │   ├── posts/          # Blog posts pages
│   │   │   └── page.tsx        # Homepage
│   │   ├── (payload)/
│   │   │   ├── admin/          # Payload admin UI
│   │   │   └── api/            # Payload REST API
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── PostCard.tsx        # Post preview component
│   └── lib/
│       ├── payload.ts          # Payload client
│       └── utils.ts            # Utility functions
├── payload.config.ts           # Payload CMS configuration
├── docker-compose.yml           # All-in-one Docker setup
├── Dockerfile                   # Production build
└── package.json
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   ┌────▼────┐                ┌─────▼─────┐
   │ Frontend │                │   Admin    │
   │ (Next.js)│                │  (Payload) │
   └────┬────┘                └─────┬─────┘
        │                           │
        └─────────────┬─────────────┘
                      │
              ┌───────▼───────┐
              │  Payload CMS   │
              │   REST API     │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │   Database    │
              │ (SQLite/Postgres)│
              └───────────────┘
```

---

## Collections

| Collection | Purpose                      | Access                      |
| ---------- | ---------------------------- | --------------------------- |
| Users      | Authentication & roles       | Admin: manage, User: read   |
| Posts      | Blog posts with rich content | Public: read published      |
| Categories | Hierarchical categorization  | Public: read                |
| Tags       | Flat cross-categorization    | Public: read                |
| Media      | File uploads & images        | Auth: upload, Admin: delete |

---

## Access Control

```
Public (logged out):
├── Read published posts
├── Read categories & tags
└── View media (if URL known)

Authenticated (logged in):
├── All public access
├── Create posts
├── Upload media files
└── Edit own posts

Admin (role = admin):
├── Full CRUD on all collections
├── Manage users
├── Access Payload admin panel
└── Delete any content
```

---

## Environment Variables

| Variable               | Required | Default               | Description                    |
| ---------------------- | -------- | --------------------- | ------------------------------ |
| PAYLOAD_SECRET_KEY     | Yes      | -                     | Secret key (32+ chars)         |
| DATABASE_URI           | No       | file:./payload.db     | SQLite/PostgreSQL connection   |
| NEXT_PUBLIC_SERVER_URL | No       | http://localhost:3000 | Server URL for OAuth callbacks |
| GOOGLE_CLIENT_ID       | No       | -                     | Google OAuth client ID         |
| GOOGLE_CLIENT_SECRET   | No       | -                     | Google OAuth client secret     |

---

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `yarn dev`       | Start development server |
| `yarn build`     | Build for production     |
| `yarn start`     | Start production server  |
| `yarn payload`   | Run Payload CLI commands |
| `yarn lint`      | Run ESLint               |
| `yarn typecheck` | Run TypeScript checks    |
| `yarn test`      | Run Vitest tests         |
| `yarn test:e2e`  | Run Playwright E2E tests |

---

## Docker

```bash
# Start all services (Next.js + PostgreSQL)
docker-compose up -d

# Open http://localhost:3000/admin
```

For production, the Dockerfile builds a standalone Node.js application.

---

## Documentation

- [LEARN.md](LEARN.md) - Payload CMS concepts, comparisons to other CMS/ORMs
- [AUTH_INFO.md](AUTH_INFO.md) - Authentication patterns deep-dive
- [STORAGE.md](STORAGE.md) - File storage strategies (local vs S3)

---

## License

MIT
