# Quick Start

Get up and running in 5 minutes.

## 1. Start with Docker Compose

```bash
cd /Users/frivajica/Projects/mini-learning/next-express-graphql
docker-compose up --build
```

Access:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000/graphql

## 2. Manual Setup

### Backend

```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000/graphql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 3. Explore the GraphQL API

Open http://localhost:4000/graphql for Apollo Sandbox.

### Try a query:

```graphql
query {
  posts(offset: 0, limit: 5) {
    items {
      title
      author {
        name
      }
      comments {
        content
      }
    }
    totalCount
    hasMore
  }
}
```

### Try a mutation (register):

```graphql
mutation {
  register(
    input: {
      email: "test@example.com"
      password: "password123"
      name: "Test User"
    }
  ) {
    token
    user {
      name
    }
  }
}
```

## 4. Pages

| Route         | What it does                  |
| ------------- | ----------------------------- |
| `/`           | Home with recent posts        |
| `/posts`      | Paginated posts list          |
| `/posts/[id]` | Post detail + comments        |
| `/products`   | Products + live stock updates |
| `/login`      | Login / Register              |

## 5. Key Commands

```bash
# Backend
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:push      # Push schema to SQLite

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```
