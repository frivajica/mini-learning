# mini-express-graphql

A production-ready mini-project for learning GraphQL with modern tech stacks.

## Features

- **Backend**: Express + Apollo Server 4 + Drizzle ORM + SQLite
- **Frontend**: Next.js 14 + Apollo Client 4 + Zustand + Tailwind CSS
- **Authentication**: JWT-based authentication
- **Pagination**: Offset pagination (Posts) and Cursor pagination (Products)
- **Real-time**: GraphQL Subscriptions for product stock updates
- **N+1 Prevention**: DataLoader for efficient batch loading

## Tech Stack

### Backend

- Apollo Server 4 (GraphQL)
- Express.js
- Drizzle ORM with SQLite
- GraphQL Subscriptions (graphql-subscriptions + graphql-ws)
- JWT Authentication (jsonwebtoken + bcryptjs)
- DataLoader for batch loading

### Frontend

- Next.js 14 (App Router)
- Apollo Client 4 with Split Link (HTTP + WebSocket)
- Zustand for state management
- Tailwind CSS

## Quick Start

### Using Docker Compose

```bash
cd /Users/frivajica/Projects/mini-learning/next-express-graphql
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:4000/graphql

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
next-express-graphql/
├── backend/
│   ├── src/
│   │   ├── db/           # Database schema and connection
│   │   ├── schema/       # GraphQL type definitions
│   │   ├── resolvers/    # GraphQL resolvers
│   │   ├── loaders/      # DataLoader for N+1 prevention
│   │   └── index.ts      # Express + Apollo Server entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   └── lib/          # Apollo Client, Zustand store
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── LEARN.md          # GraphQL concepts and learning guide
│   └── AUTH_INFO.md      # JWT authentication details
├── docker-compose.yml
└── README.md
```

## GraphQL API

### Queries

- `me` - Get current authenticated user
- `users` - List all users
- `user(id)` - Get user by ID
- `posts(offset, limit)` - List posts with offset pagination
- `post(id)` - Get single post with comments and author
- `comments(postId)` - List comments for a post
- `products(cursor, limit)` - List products with cursor pagination
- `product(id)` - Get single product

### Mutations

- `register(input)` - Register new user
- `login(input)` - Login user
- `createPost(input)` - Create new post
- `updatePost(id, input)` - Update a post
- `deletePost(id)` - Delete a post
- `createComment(input)` - Add comment to a post
- `deleteComment(id)` - Delete a comment
- `createProduct(input)` - Create a product
- `updateProduct(id, input)` - Update a product
- `deleteProduct(id)` - Delete a product
- `updateStock(id, stock)` - Update product stock (triggers subscription)

### Subscriptions

- `stockUpdated` - Real-time stock update notifications

## Pages

| Route         | Description                                          |
| ------------- | ---------------------------------------------------- |
| `/`           | Home page with recent posts                          |
| `/posts`      | Posts list with offset pagination                    |
| `/posts/[id]` | Post detail with comments                            |
| `/products`   | Products with cursor pagination + live stock updates |
| `/login`      | Login/Register page                                  |
