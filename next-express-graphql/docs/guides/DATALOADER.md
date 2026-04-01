# DataLoader Guide

How N+1 queries are prevented in this project.

## The Problem: N+1 Queries

When fetching nested data, naive resolvers cause N+1 queries:

```graphql
query {
  posts(offset: 0, limit: 10) {
    items {
      title
      author {
        name
      } # 10 posts = 10 queries
      comments {
        content
      } # 10 posts = 10 more queries
    }
  }
}
```

**Without DataLoader:** 1 + 10 + 10 = 21 database queries

## The Solution: DataLoader

DataLoader batches multiple requests into a single query:

```typescript
// backend/src/loaders/index.ts
import DataLoader from "dataloader";
import { db } from "../db";
import { comments } from "../db/schema";

const commentsByPostLoader = new DataLoader<string, Comment[]>(
  async (postIds) => {
    // Single query for ALL comments
    const allComments = await db.select().from(comments);

    // Group by postId
    const grouped = new Map<string, Comment[]>();
    for (const comment of allComments) {
      if (!grouped.has(comment.postId)) {
        grouped.set(comment.postId, []);
      }
      grouped.get(comment.postId)!.push(comment);
    }

    // Return in same order as postIds
    return postIds.map((id) => grouped.get(id) || []);
  },
);
```

**With DataLoader:** 3 queries total (posts, users, comments)

---

## This Project's Loaders

```typescript
// backend/src/loaders/index.ts
export const createLoaders = () => ({
  userLoader: new DataLoader<string, User | null>(async (ids) => {
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id) || null);
  }),

  postLoader: new DataLoader<string, Post | null>(async (ids) => {
    const allPosts = await db.select().from(posts);
    const postMap = new Map(allPosts.map((p) => [p.id, p]));
    return ids.map((id) => postMap.get(id) || null);
  }),

  commentsByPostLoader: new DataLoader<string, Comment[]>(async (postIds) => {
    const allComments = await db.select().from(comments);
    const grouped = new Map<string, Comment[]>();
    for (const comment of allComments) {
      if (!grouped.has(comment.postId)) {
        grouped.set(comment.postId, []);
      }
      grouped.get(comment.postId)!.push(comment);
    }
    return postIds.map((id) => grouped.get(id) || []);
  }),

  postsByUserLoader: new DataLoader<string, Post[]>(async (userIds) => {
    const allPosts = await db.select().from(posts);
    const grouped = new Map<string, Post[]>();
    for (const post of allPosts) {
      if (!grouped.has(post.authorId)) {
        grouped.set(post.authorId, []);
      }
      grouped.get(post.authorId)!.push(post);
    }
    return userIds.map((id) => grouped.get(id) || []);
  }),
});
```

---

## Using Loaders in Resolvers

```typescript
// backend/src/resolvers/posts.ts
export const postResolvers = {
  Post: {
    author: async (parent, _, { loaders }) => {
      // Uses DataLoader - batches all author lookups
      return loaders.userLoader.load(parent.authorId);
    },

    comments: async (parent, _, { loaders }) => {
      // Uses DataLoader - batches all comment lookups
      return loaders.commentsByPostLoader.load(parent.id);
    },
  },
};
```

## Context Setup

Loaders are created per-request to avoid cache pollution:

```typescript
// backend/src/index.ts
const server = new ApolloServer({
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse({ context }) {
            // Loaders are in context
          },
        };
      },
    },
  ],
});

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async () => ({
      loaders: createLoaders(), // New loaders per request
      userId,
    }),
  }),
);
```

---

## Why New Loaders Per Request?

DataLoader has built-in caching within a request:

```typescript
// If you call load("123") 5 times, it only queries once
const loader = new DataLoader((keys) => fetchByIds(keys));
loader.load("123"); // Query executes
loader.load("123"); // Returns cached
loader.load("123"); // Returns cached
```

But across requests, you want fresh data, so we create new loaders per request.

---

## Benefits

| Without DataLoader   | With DataLoader              |
| -------------------- | ---------------------------- |
| 21 queries           | 3 queries                    |
| Slow for large lists | Fast regardless of list size |
| Database overload    | Single batched query         |

---

## Key Takeaway

Always use DataLoader for:

- Foreign key relationships (author, user)
- One-to-many relationships (comments on posts)
- Any field that requires additional queries
