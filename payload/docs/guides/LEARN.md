# Learning Payload CMS

A guide to understanding Payload CMS through concepts, code examples, and comparisons to other technologies.

---

## Table of Contents

1. [Why Payload CMS?](#why-payload-cms)
2. [Core Concepts](#core-concepts)
3. [Collections vs Traditional Tables](#collections-vs-traditional-tables)
4. [Access Control Patterns](#access-control-patterns)
5. [Authentication](#authentication)
6. [File Storage](#file-storage)
7. [Common Mistakes](#common-mistakes)
8. [Payload vs Alternatives](#payload-vs-alternatives)

---

## Why Payload CMS?

### The Problem It Solves

Traditional CMS options often force a choice:

- **WordPress/Drupal**: PHP-based, monolithic, hard to customize
- **Headless CMS (Contentful/Sanity)**: Expensive, data locked in their platform
- **Custom Backend**: Reinventing the wheel for every project

### When to Use Payload

- ✅ Use when building content-heavy applications (blogs, e-commerce, documentation)
- ✅ Use when you need a customizable admin UI without building it yourself
- ✅ Use when you want type-safe content definitions
- ❌ Don't use when you just need a simple database (use Prisma/Drizzle directly)
- ❌ Don't use when you need a fully managed SaaS solution

---

## Core Concepts

### Collections

Collections in Payload are like database tables, but smarter:

```typescript
// Payload collection definition
const posts = {
  slug: "posts",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "content", type: "richText" },
    { name: "author", type: "relationship", relationTo: "users" },
  ],
};
```

**JS/TS Analogy**: Collections are like TypeScript interfaces - they define the shape of your data with type safety baked in.

### Access Control

Payload has field-level and collection-level access control:

```typescript
access: {
  // Who can read
  read: ({ req: { user }, doc }) => {
    if (user?.role === "admin") return true;
    return doc?.status === "published";
  },

  // Who can create
  create: ({ req: { user } }) => Boolean(user),

  // Who can update
  update: ({ req: { user }, doc }) => {
    return user?.role === "admin" || doc?.author === user?.id;
  },
},
```

### Hooks

Hooks let you intercept and modify operations:

```typescript
hooks: {
  beforeChange: [
    ({ data, operation }) => {
      if (operation === "create") {
        data.slug = generateSlug(data.title);
      }
      return data;
    },
  ],
  afterChange: [
    ({ doc }) => {
      // Send notification, revalidate cache, etc.
    },
  ],
},
```

---

## Collections vs Traditional Tables

### Traditional Database Table

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Payload Collection

```typescript
const posts = {
  slug: "posts",
  fields: [
    { name: "title", type: "text", required: true, maxLength: 255 },
    { name: "slug", type: "text", unique: true },
    { name: "content", type: "richText" },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
    },
    {
      name: "status",
      type: "select",
      options: ["draft", "published"],
      defaultValue: "draft",
    },
  ],
};
```

### Key Differences

| Aspect            | Traditional SQL     | Payload Collections       |
| ----------------- | ------------------- | ------------------------- |
| Schema Definition | SQL + ORM migration | TypeScript config         |
| Admin UI          | Build yourself      | Built-in, customizable    |
| API Layer         | Build yourself      | Built-in REST/GraphQL     |
| Validation        | Manual or ORM-level | Field-level built-in      |
| Relationships     | Foreign keys        | `relationship` field type |

---

## Access Control Patterns

### Pattern 1: Public vs Private Content

```typescript
const posts = {
  access: {
    read: ({ req: { user }, doc }) => {
      // Admins see everything
      if (user?.role === "admin") return true;

      // Published posts are public
      if (doc?.status === "published") return true;

      // Authors see their own drafts
      if (user) return doc?.author === user.id;

      // Everyone else sees nothing
      return false;
    },
  },
};
```

### Pattern 2: Role-Based Access

```typescript
const users = {
  access: {
    // Only admins can manage users
    admin: ({ req: { user } }) => user?.role === "admin",

    // Users can only update their own profile
    update: ({ req: { user } }) => user?.role === "admin",
  },
};
```

### Pattern 3: Field-Level Access

```typescript
fields: [
  { name: "title", type: "text" },
  {
    name: "internalNotes",
    type: "text",
    access: {
      read: ({ req: { user } }) => user?.role === "admin",
      update: ({ req: { user } }) => user?.role === "admin",
    },
  },
],
```

---

## Authentication

### Built-in Auth

Payload has authentication built-in:

```typescript
const users = {
  slug: "users",
  auth: true, // Enables email/password authentication
  fields: [
    { name: "email", type: "email", required: true },
    { name: "password", type: "text", required: true },
    { name: "role", type: "select", options: ["admin", "user"] },
  ],
};
```

### Login from Frontend

```typescript
import { getPayload } from "@/lib/payload";

async function login(email: string, password: string) {
  const payload = await getPayload();

  const { user, token } = await payload.findByID({
    collection: "users",
    id: email, // or use login method
  });

  return { user, token };
}
```

### Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console
2. Add to Payload config:

```typescript
export default buildConfig({
  // ...
  plugins: [
    googleOauthPlugin({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth/callback/google",
    }),
  ],
});
```

---

## File Storage

### Local Storage (Development)

```typescript
const media = {
  slug: "media",
  upload: {
    staticDir: "uploads", // Files stored in ./uploads
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300 },
      { name: "card", width: 768, height: 512 },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "application/pdf"],
  },
};
```

### S3 Storage (Production)

```typescript
import { s3Adapter } from "@payloadcms/storage-s3";

const media = {
  slug: "media",
  upload: {
    adapter: s3Adapter({
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
      },
    }),
  },
};
```

---

## Common Mistakes

| Mistake                           | Why It's Wrong                    | Correct Approach                               |
| --------------------------------- | --------------------------------- | ---------------------------------------------- |
| Not defining access control       | Anyone can read/write everything  | Always define read/create/update/delete access |
| Using `auth: true` without roles  | Can't distinguish admin from user | Add role field with access control             |
| Storing files without size limits | Server storage exhaustion         | Set `maxFileSize` in upload config             |
| Ignoring slug uniqueness          | Duplicate slugs break URLs        | Use `unique: true` on slug field               |
| Not using draft status            | Publishing without review         | Use `_status` field for workflow               |

---

## Payload vs Alternatives

### Payload vs Supabase

| Aspect       | Payload CMS                    | Supabase                        |
| ------------ | ------------------------------ | ------------------------------- |
| Approach     | CMS-first (admin UI)           | Database-first (build your own) |
| Auth         | Built-in + OAuth               | Built-in + custom               |
| Admin UI     | Built-in, customizable         | Build yourself                  |
| Database     | Any (SQLite, Postgres, Mongo)  | PostgreSQL only                 |
| File Storage | Built-in upload handling       | Use separate service            |
| Best for     | Content-heavy apps needing CMS | Data-heavy apps with custom UI  |

### Payload vs Prisma

| Aspect     | Payload CMS           | Prisma                |
| ---------- | --------------------- | --------------------- |
| Purpose    | Content management    | Database access       |
| Admin UI   | Built-in              | None (build yourself) |
| API        | Built-in REST/GraphQL | Build yourself        |
| Migrations | Automatic             | Explicit migrations   |
| Best for   | CMS use cases         | General CRUD apps     |

### When to Choose Each

```
Choose Payload CMS when:
├── You need an admin UI for non-technical users
├── Content management is a core feature
└── You want built-in authentication

Choose Prisma/Drizzle when:
├── You don't need an admin UI
├── Custom API logic is complex
└── Database access patterns are unique

Choose Supabase when:
├── You want a backend-as-a-service
├── Real-time subscriptions are needed
└── You're comfortable building UI yourself
```

---

## See Also

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [AUTH_INFO.md](AUTH_INFO.md) - Authentication deep-dive
- [STORAGE.md](STORAGE.md) - File storage patterns
- [Next.js Documentation](https://nextjs.org/docs)
