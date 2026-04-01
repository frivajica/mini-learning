# GraphQL Guide

Learn GraphQL concepts with examples from this project.

## What is GraphQL?

GraphQL is a query language for APIs that lets clients request exactly the data they need.

### REST vs GraphQL

**REST:**

```javascript
GET / api / users / 1; // Get user
GET / api / users / 1 / posts; // Get user's posts
GET / api / posts / 1 / comments; // Get post's comments
```

**GraphQL (one request):**

```graphql
query {
  post(id: "1") {
    title
    author {
      name
    }
    comments {
      content
      author {
        name
      }
    }
  }
}
```

---

## Core Concepts

### 1. Schema & Types

Define your API structure:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}
```

Symbols:

- `!` = Non-nullable (required)
- `[Type!]!` = Non-null array of non-null items

### 2. Queries (Read)

```graphql
# Simple query
query {
  users {
    name
    email
  }
}

# With arguments
query {
  post(id: "123") {
    title
    content
  }
}

# With nested data
query {
  post(id: "123") {
    title
    author {
      name
    }
  }
}
```

### 3. Mutations (Write)

```graphql
mutation {
  createPost(input: { title: "Hello", content: "World" }) {
    id
    title
  }
}
```

### 4. Subscriptions (Real-time)

```graphql
subscription {
  stockUpdated {
    id
    name
    stock
  }
}
```

---

## Pagination

### Offset Pagination (Posts)

Best for: numbered pages, known total count

```graphql
query {
  posts(offset: 0, limit: 10) {
    items {
      title
    }
    totalCount # Total number of items
    hasMore # More pages exist?
  }
}
```

### Cursor Pagination (Products)

Best for: infinite scroll, real-time data

```graphql
# First page
query {
  products(limit: 10) {
    items {
      name
    }
    hasMore
    cursor # Use this for next page
  }
}

# Next page
query {
  products(cursor: "abc123", limit: 10) {
    items {
      name
    }
    hasMore
    cursor
  }
}
```

---

## Nested Queries

GraphQL excels at fetching nested data in one request:

```graphql
query {
  posts(offset: 0, limit: 5) {
    items {
      title
      author {
        # Nested user
        name
      }
      comments {
        # Nested comments
        content
        author {
          # Nested author within comment
          name
        }
      }
    }
  }
}
```

**Without DataLoader**: This would cause N+1 queries
**With DataLoader**: Only 3-4 queries regardless of nesting depth

---

## Variables

Use variables instead of hardcoding:

```graphql
query GetPost($id: ID!) {
  post(id: $id) {
    title
    content
  }
}
```

Variables:

```json
{ "id": "123" }
```

---

## Fragments

Reuse common field sets:

```graphql
fragment UserFields on User {
  id
  name
  email
}

query {
  user(id: "1") {
    ...UserFields
  }
  user(id: "2") {
    ...UserFields
  }
}
```

---

## Aliases

Rename fields to avoid conflicts:

```graphql
query {
  admin: user(id: "1") {
    name
    role
  }
  regular: user(id: "2") {
    name
  }
}
```

---

## Directives

Dynamic queries based on conditions:

```graphql
query ($withEmail: Boolean!) {
  user(id: "1") {
    name
    email @include(if: $withEmail)
  }
}
```

---

## Error Handling

GraphQL returns errors alongside data:

```json
{
  "data": { "post": null },
  "errors": [
    {
      "message": "Post not found",
      "path": ["post"]
    }
  ]
}
```

---

## Next Steps

- See [API Reference](../API.md) for full API docs
- See [DataLoader Guide](./DATALOADER.md) for N+1 prevention
- Try queries in Apollo Sandbox at http://localhost:4000/graphql
