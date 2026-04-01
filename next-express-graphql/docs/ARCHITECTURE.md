# Architecture

How the pieces fit together.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  Next.js 14 + Apollo Client 4 + Zustand + Tailwind      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / WebSocket
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      Backend                            │
│  Express + Apollo Server 4 + Drizzle ORM + SQLite       │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Home page
│   ├── posts/
│   │   ├── page.tsx      # Posts list (offset pagination)
│   │   └── [id]/page.tsx # Post detail
│   ├── products/page.tsx # Products (cursor pagination)
│   └── login/page.tsx    # Auth page
└── lib/
    ├── apollo.ts         # Apollo Client setup
    ├── store.ts          # Zustand auth store
    ├── queries.ts        # GraphQL queries
    └── mutations.ts      # GraphQL mutations
```

### Apollo Client Split Link

```typescript
// Routes queries via HTTP, subscriptions via WebSocket
const splitLink = split(
  ({ query }) => isSubscription(query),
  wsLink, // graphql-ws for subscriptions
  httpLink, // HTTP for queries/mutations
);
```

## Backend Architecture

```
backend/src/
├── index.ts              # Express + Apollo Server entry
├── db/
│   ├── schema.ts        # Drizzle schema (users, posts, comments, products)
│   └── index.ts        # Database connection
├── schema/
│   └── typeDefs.ts     # GraphQL type definitions
├── resolvers/
│   ├── index.ts        # Combined resolvers
│   ├── users.ts       # Auth resolvers
│   ├── posts.ts        # Post CRUD + offset pagination
│   ├── comments.ts     # Comment CRUD
│   └── products.ts     # Product CRUD + cursor + subscriptions
└── loaders/
    └── index.ts        # DataLoader for N+1 prevention
```

## Data Flow

### Query with Nested Data (N+1 Prevention)

```graphql
query {
  posts(offset: 0, limit: 5) {
    items {
      title
      author {
        name
      } # DataLoader batches these
      comments {
        # DataLoader batches these
        content
        author {
          name
        }
      }
    }
  }
}
```

**Without DataLoader**: 1 + N + M queries (N posts, M comments)
**With DataLoader**: 3 queries max (posts, users, comments)

### Subscription Flow

```
Frontend                          Backend
    │                                │
    │── subscribe ─────────────────►│
    │                                │
    │◄──────── stockUpdated ─────────│
    │   (WebSocket push)             │
    │                                │
```

## Database Schema

```
┌─────────┐       ┌─────────┐       ┌────────────┐
│  users  │──1:N──│  posts  │──1:N──│  comments  │
└─────────┘       └─────────┘       └────────────┘
                        │
                        │  (separate entity)
                        ▼
                   ┌──────────┐
                   │ products │
                   └──────────┘
```

## Key Patterns

1. **Schema-First**: Define types in `typeDefs.ts`, implement in `resolvers/`
2. **Context**: Auth & loaders shared via GraphQL context
3. **Batch Loading**: DataLoader prevents N+1 queries
4. **Split Link**: Apollo Client routes by operation type
