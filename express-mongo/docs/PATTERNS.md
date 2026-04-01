# MongoDB Patterns

## Embedding vs Referencing

MongoDB offers two ways to model relationships between documents:

### Embedding (Denormalized)

Related data is stored within the same document.

```typescript
// Product with embedded reviews
const productSchema = new Schema({
  name: String,
  price: Number,
  reviews: [
    {
      author: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});
```

**When to use:**

- Data is accessed together most of the time
- Updates to related data are infrequent
- Data has a bounded size (e.g., a product with ≤100 reviews)

**Advantages:**

- Single query to fetch complete object
- No $lookup needed
- Atomic writes (single document)

**Disadvantages:**

- Document size can grow large
- Updating embedded data requires rewriting the document
- Duplication if same data appears in multiple places

### Referencing (Normalized)

Documents store references (ObjectIds) to other documents.

```typescript
// Product references Category
const productSchema = new Schema({
  name: String,
  price: Number,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

// Category is a separate collection
const categorySchema = new Schema({
  name: String,
  slug: String,
});
```

**When to use:**

- Data is accessed independently
- Relationships are many-to-many
- Data is shared across multiple documents
- Data size is unbounded

**Advantages:**

- No data duplication
- Each document stays small
- Relationships are explicit

**Disadvantages:**

- Requires $lookup or application-level joins
- Multiple queries to fetch related data
- Referencial integrity not enforced

## This Project's Patterns

### Embedded: Product Reviews

Reviews are embedded in products because:

- Reviews are accessed with the product
- A product typically has a reasonable number of reviews
- Reviews are updated/deleted with the product

```typescript
// In Product model
reviews: [reviewSchema];

// Adding a review
product.reviews.push({ author: "John", rating: 5, comment: "Great!" });
await product.save();
```

### Referenced: Product Category

Category is referenced because:

- Categories are shared across many products
- Categories may be accessed independently
- Updating a category affects all products

```typescript
// In Product model
category: { type: Schema.Types.ObjectId, ref: "Category" }

// Query with population
const product = await Product.findById(id).populate("category", "name slug");
```

### Embedded: Order Items

Order items are embedded because:

- Orders are immutable (typically)
- Items are accessed with the order
- Item data snapshot is taken at order time

```typescript
// In Order model
items: [
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: Number,
  },
];
```

## Pattern Decision Guide

Ask yourself:

1. **Do I need atomic updates?** Embed if yes.
2. **Is the data size bounded?** Embed if small, reference if unbounded.
3. **Is data shared across documents?** Reference if yes.
4. **Do I query this data together?** Embed if yes.
5. **Do I need referential integrity?** Reference (or accept the tradeoff).

## Best Practices

1. **Limit document size** - MongoDB has a 16MB limit
2. **Use meaningful ObjectIds** - They contain timestamp info
3. **Index wisely** - Index fields you query on
4. **Consider denormalization** - Sometimes duplicating data is fine for read performance
