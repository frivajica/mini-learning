# MongoDB vs PostgreSQL Comparison

## Overview

| Aspect        | MongoDB                            | PostgreSQL               |
| ------------- | ---------------------------------- | ------------------------ |
| Type          | Document database                  | Relational database      |
| Data Model    | JSON-like documents                | Tables with rows/columns |
| Schema        | Flexible (schema-less)             | Rigid (defined upfront)  |
| Relationships | Embed or reference                 | Joins via FK             |
| Transactions  | Single document (multi-doc in v4+) | ACID across tables       |
| Scaling       | Horizontal (sharding)              | Vertical (mostly)        |
| JOINs         | Manual ($lookup) or embedded       | Native SQL joins         |

## When to Use MongoDB

### Advantages

1. **Schema Flexibility** - Add/remove fields without migrations
2. **Document Model** - Natural fit for hierarchical data
3. **Write Performance** - Single document writes are atomic
4. **Horizontal Scaling** - Built-in sharding
5. **JSON Storage** - No object-relational mapping needed

### Use Cases

- Product catalogs with varying attributes
- User profiles with custom fields
- Content management systems
- Real-time analytics
- IoT data storage

## When to Use PostgreSQL

### Advantages

1. **ACID Transactions** - Guaranteed consistency
2. **Complex Queries** - Native JOINs, subqueries, window functions
3. **Data Integrity** - Foreign keys, check constraints, triggers
4. **Mature Ecosystem** - Decades of tooling and optimization
5. **Advanced Features** - Full-text search, GIS, JSONB

### Use Cases

- Financial applications
- Complex relational data
- Applications requiring strict data integrity
- Multi-entity transactions

## Code Comparison

### Creating a Record

**MongoDB (Mongoose)**

```typescript
const product = await Product.create({
  name: "Laptop",
  price: 999.99,
  tags: ["electronics", "computer"],
});
```

**PostgreSQL (Prisma)**

```typescript
const product = await prisma.product.create({
  data: {
    name: "Laptop",
    price: 999.99,
    tags: ["electronics", "computer"],
  },
});
```

### Querying with Relations

**MongoDB (requires $lookup)**

```typescript
const orders = await Order.aggregate([
  { $match: { userId: user._id } },
  {
    $lookup: {
      from: "products",
      localField: "items.productId",
      foreignField: "_id",
      as: "productDetails",
    },
  },
]);
```

**PostgreSQL (native join)**

```typescript
const orders = await prisma.order.findMany({
  where: { userId },
  include: { items: { include: { product: true } } },
});
```

### Schema Changes

**MongoDB**

```typescript
// Add new field without migration
productSchema.add({ newField: String });

// Documents can have different shapes
{ name: "A", newField: "value" }
{ name: "B" } // newField is undefined
```

**PostgreSQL**

```typescript
// Requires migration
ALTER TABLE products ADD COLUMN new_field VARCHAR;

// All rows must conform
```

## This Project's MongoDB Patterns

See [PATTERNS.md](./PATTERNS.md) for detailed examples of:

- Embedding reviews in products
- Referencing categories in products
- Embedding order items in orders
