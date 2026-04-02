# Architecture

How the pieces fit together.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│         Next.js 16 + Tailwind CSS + React 19             │
└─────────────────────┬───────────────────────────────────┘
                       │ HTTP / GraphQL
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Payload CMS 3.x                       │
│         Admin UI + REST/GraphQL API                     │
└─────────────────────┬───────────────────────────────────┘
                       │ SQL
                       ▼
┌─────────────────────────────────────────────────────────┐
│         SQLite (dev) / PostgreSQL (prod)                │
└─────────────────────────────────────────────────────────┘
```

## Request Pipeline (Next.js 16 Proxy)

```
Request → proxy.ts → Security Headers → Auth Check → Route Handler
                ↓
         Rate Limiting (API routes)
```

## Project Structure

```
payload/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/            # Public frontend routes
│   │   │   └── posts/
│   │   │       ├── page.tsx      # Posts list
│   │   │       └── [slug]/
│   │   │           └── page.tsx  # Single post
│   │   ├── (payload)/        # Payload admin routes
│   │   │   ├── admin/        # Admin UI
│   │   │   └── api/         # Payload REST API
│   │   │       └── [...slug]/ # Custom API endpoints
│   │   ├── api/
│   │   │   └── health/      # Health check endpoints
│   │   │       ├── live/
│   │   │       └── ready/
│   │   ├── error.tsx         # Error boundary
│   │   ├── not-found.tsx     # Custom 404
│   │   ├── layout.tsx
│   │   └── page.tsx          # Homepage
│   ├── collections/           # Modular collection configs
│   │   ├── index.ts
│   │   ├── Users.ts
│   │   ├── Posts.ts
│   │   ├── Categories.ts
│   │   ├── Tags.ts
│   │   └── Media.ts
│   ├── components/
│   │   └── PostCard.tsx
│   └── lib/
│       ├── payload.ts          # Payload client singleton
│       ├── lexical.ts          # Lexical → HTML converter
│       ├── rate-limit.ts      # Rate limiting utility
│       └── utils.ts           # Utility functions
├── proxy.ts                    # Next.js 16 Proxy (middleware)
├── payload.config.ts            # Payload CMS configuration
├── docker-compose.yml          # Docker setup with HEALTHCHECK
└── package.json
```

## Payload Configuration

`payload.config.ts` is the central configuration defining:

- **Database**: SQLite (dev) or PostgreSQL (prod)
- **Collections**: Users, Posts, Categories, Tags, Media
- **Editor**: Lexical rich-text editor
- **Access Control**: Role-based (admin/user)
- **Upload**: Image processing with thumbnail/card sizes

## Data Flow

### Content Management

```
Admin User → Payload Admin UI → Collections → Database
```

### Public Access

```
Visitor → Frontend Page → Payload API → Database
```

### Custom API

```
Client → /api/[slug] → Rate Limiting → Payload Instance → Database
```

## Key Patterns

1. **Singleton Payload Client** - `src/lib/payload.ts` for consistent access
2. **Modular Collections** - Each collection in separate file
3. **Role-Based Access** - Admin vs User permissions
4. **Draft/Publish** - Posts have draft/publish workflow
5. **Lexical Rendering** - `src/lib/lexical.ts` converts rich text to HTML
6. **Rate Limiting** - In-memory store with 100 req/min limit

## Docker Setup

| Service    | Image         | Purpose             |
| ---------- | ------------- | ------------------- |
| `app`      | Dockerfile    | Next.js + Payload (with HEALTHCHECK) |
| `postgres` | postgres:16-alpine | PostgreSQL database |

## Testing

| Type | Tool       | Location         |
| ---- | ---------- | ---------------- |
| Unit | Vitest     | `src/__tests__/` |
| E2E  | Playwright | `e2e/`           |
