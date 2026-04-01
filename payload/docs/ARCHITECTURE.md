# Architecture

How the pieces fit together.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│         Next.js 15 + Tailwind CSS + React 19            │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / GraphQL
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Payload CMS 3.0                       │
│         Admin UI + REST/GraphQL API                     │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL
                      ▼
┌─────────────────────────────────────────────────────────┐
│         SQLite (dev) / PostgreSQL (prod)               │
└─────────────────────────────────────────────────────────┘
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
│   │   │   └── api/          # Custom API endpoints
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
│   │   ├── PostCard.tsx
│   │   └── ui/
│   └── lib/
│       ├── payload.ts         # Payload client singleton
│       └── utils.ts           # Utility functions
├── docs/                      # Documentation
├── payload.config.ts          # Payload CMS configuration
├── docker-compose.yml         # Docker setup
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
Client → /api/[slug] → Payload Instance → Database
```

## Collections

| Collection | Slug         | Purpose               | Auth        |
| ---------- | ------------ | --------------------- | ----------- |
| Users      | `users`      | Authentication, roles | Required    |
| Posts      | `posts`      | Blog content          | Conditional |
| Categories | `categories` | Hierarchical taxonomy | Conditional |
| Tags       | `tags`       | Flat taxonomy         | Conditional |
| Media      | `media`      | File uploads          | Conditional |

## Key Patterns

1. **Singleton Payload Client** - `src/lib/payload.ts` for consistent access
2. **Modular Collections** - Each collection in separate file
3. **Role-Based Access** - Admin vs User permissions
4. **Draft/Publish** - Posts have draft/publish workflow

## Docker Setup

| Service    | Image         | Purpose             |
| ---------- | ------------- | ------------------- |
| `app`      | Dockerfile    | Next.js + Payload   |
| `postgres` | postgres:16.4 | PostgreSQL database |

## Testing

| Type | Tool       | Location         |
| ---- | ---------- | ---------------- |
| Unit | Vitest     | `src/__tests__/` |
| E2E  | Playwright | `e2e/`           |
