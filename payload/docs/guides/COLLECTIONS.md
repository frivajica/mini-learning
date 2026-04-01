# Collections Guide

Collection configuration in this project.

## Overview

Collections are defined in `src/collections/` and imported into `payload.config.ts`.

```
src/collections/
├── index.ts        # Exports all collections
├── Users.ts       # User authentication collection
├── Posts.ts       # Blog posts collection
├── Categories.ts # Hierarchical categories
├── Tags.ts        # Flat tags
└── Media.ts      # File uploads
```

## Collection Configuration

Each collection is a separate file exporting a Payload collection configuration.

### Users Collection

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: [...] },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
  ],
  access: {
    admin: ({ req: { user } }) => user?.role === 'admin',
  },
};
```

### Posts Collection

```typescript
export const Posts: CollectionConfig = {
  slug: "posts",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text" },
    { name: "content", type: "richText" },
    { name: "author", type: "relationship", relationTo: "users" },
    { name: "category", type: "relationship", relationTo: "categories" },
    { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
  ],
  hooks: {
    beforeChange: [setPublishedAt],
  },
};
```

## Access Control

### Role-Based Access

```typescript
access: {
  // Only admins can access admin panel
  admin: ({ req: { user } }) => user?.role === 'admin',

  // Anyone logged in can create
  create: () => true,

  // Users can only read published
  read: ({ doc }) => doc.status === 'published' || req.user.role === 'admin',
}
```

## Hooks

### beforeChange

Used to modify data before saving:

```typescript
{
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data.status === 'published') {
          data.publishedAt = new Date();
        }
        return data;
      },
    ],
  },
}
```

## Pagination

Collections support pagination with `defaultLimit` and `max`:

```typescript
{
  admin: {
    useAsTitle: 'title',
    defaultLimit: 10,
    // ...
  },
}
```

## Relationships

### One-to-One

```typescript
{ name: 'author', type: 'relationship', relationTo: 'users' }
```

### One-to-Many

```typescript
{ name: 'category', type: 'relationship', relationTo: 'categories', hasMany: false }
```

### Many-to-Many

```typescript
{ name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true }
```

## Upload Configuration

```typescript
{
  upload: {
    staticDir: 'uploads',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 768, height: 512 },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
}
```
