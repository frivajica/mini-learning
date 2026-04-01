# API Reference

Complete GraphQL API documentation.

## Queries

### me

Get the currently authenticated user.

```graphql
query {
  me {
    id
    email
    name
  }
}
```

### users

List all users.

```graphql
query {
  users {
    id
    email
    name
  }
}
```

### user(id: ID!)

Get a user by ID.

```graphql
query {
  user(id: "user-123") {
    id
    email
    name
    posts {
      title
    }
  }
}
```

### posts(offset: Int, limit: Int)

List posts with **offset pagination**.

```graphql
query {
  posts(offset: 0, limit: 10) {
    items {
      id
      title
      content
      author {
        id
        name
      }
      comments {
        id
        content
      }
    }
    totalCount
    hasMore
  }
}
```

### post(id: ID!)

Get a single post with all nested data.

```graphql
query {
  post(id: "post-123") {
    id
    title
    content
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

### products(cursor: String, limit: Int)

List products with **cursor pagination**.

```graphql
query {
  products(cursor: null, limit: 10) {
    items {
      id
      name
      description
      price
      stock
    }
    totalCount
    hasMore
    cursor
  }
}
```

---

## Mutations

### register(input: RegisterInput!)

Register a new user.

```graphql
mutation {
  register(
    input: {
      email: "user@example.com"
      password: "password123"
      name: "John Doe"
    }
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### login(input: LoginInput!)

Login and get a JWT token.

```graphql
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    token
    user {
      id
      name
    }
  }
}
```

### createPost(input: CreatePostInput!)

Create a new post. **Requires auth**.

```graphql
mutation {
  createPost(input: { title: "My Post", content: "Post content here" }) {
    id
    title
    createdAt
  }
}
```

### updatePost(id: ID!, input: UpdatePostInput!)

Update a post. **Requires auth** (owner only).

```graphql
mutation {
  updatePost(id: "post-123", input: { title: "Updated Title" }) {
    id
    title
    updatedAt
  }
}
```

### deletePost(id: ID!)

Delete a post. **Requires auth** (owner only).

```graphql
mutation {
  deletePost(id: "post-123")
}
```

### createComment(input: CreateCommentInput!)

Add a comment to a post. **Requires auth**.

```graphql
mutation {
  createComment(input: { postId: "post-123", content: "Great post!" }) {
    id
    content
    createdAt
  }
}
```

### deleteComment(id: ID!)

Delete a comment. **Requires auth** (owner only).

```graphql
mutation {
  deleteComment(id: "comment-123")
}
```

### createProduct(input: CreateProductInput!)

Create a product. **Requires auth**.

```graphql
mutation {
  createProduct(
    input: {
      name: "Widget"
      description: "A useful widget"
      price: 29.99
      stock: 100
    }
  ) {
    id
    name
    price
  }
}
```

### updateProduct(id: ID!, input: UpdateProductInput!)

Update a product. **Requires auth**.

```graphql
mutation {
  updateProduct(id: "product-123", input: { price: 39.99 }) {
    id
    name
    price
  }
}
```

### deleteProduct(id: ID!)

Delete a product. **Requires auth**.

```graphql
mutation {
  deleteProduct(id: "product-123")
}
```

### updateStock(id: ID!, stock: Int!)

Update product stock. **Requires auth**. Triggers subscription.

```graphql
mutation {
  updateStock(id: "product-123", stock: 50) {
    id
    name
    stock
  }
}
```

---

## Subscriptions

### stockUpdated

Real-time stock update notifications.

```graphql
subscription {
  stockUpdated {
    id
    name
    stock
  }
}
```

**Frontend usage:**

```typescript
import { useSubscription } from "@apollo/client";
import { STOCK_UPDATED_SUBSCRIPTION } from "@/lib/queries";

function ProductPage() {
  const { data } = useSubscription(STOCK_UPDATED_SUBSCRIPTION);
  // data.stockUpdated contains the updated product
}
```

---

## Types

### PostsConnection

```typescript
{
  items: Post[]       // The posts for this page
  totalCount: Int     // Total number of posts
  hasMore: Boolean    // Whether more pages exist
}
```

### ProductsConnection

```typescript
{
  items: Product[]     // The products for this page
  totalCount: Int     // Total number of products
  hasMore: Boolean    // Whether more pages exist
  cursor: String      // Use as 'cursor' param for next page
}
```

### AuthPayload

```typescript
{
  token: String!; // JWT token
  user: User!; // The authenticated user
}
```

### Inputs

| Input              | Fields                              |
| ------------------ | ----------------------------------- |
| RegisterInput      | email, password, name               |
| LoginInput         | email, password                     |
| CreatePostInput    | title, content                      |
| UpdatePostInput    | title?, content?                    |
| CreateCommentInput | postId, content                     |
| CreateProductInput | name, description?, price, stock    |
| UpdateProductInput | name?, description?, price?, stock? |
