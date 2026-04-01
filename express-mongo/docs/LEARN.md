# Learning MongoDB with Mongoose

## Introduction

MongoDB is a NoSQL document database that stores data in JSON-like documents. Mongoose is an ODM (Object Data Modeling) library that adds schema validation and structure to MongoDB.

## Key Concepts

### Documents

MongoDB stores documents in collections. Documents are JSON-like objects:

```javascript
{
  _id: ObjectId("..."),
  name: "Laptop",
  price: 999.99,
  inStock: true,
  tags: ["electronics", "computer"]
}
```

### ObjectId

Every document has a unique `_id` field. Mongoose provides `mongoose.Types.ObjectId`:

```typescript
const productId = new mongoose.Types.ObjectId();
```

### Schemas

Schemas define the structure of documents:

```typescript
const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true },
  tags: [{ type: String }],
});
```

### Models

Models are constructors compiled from schemas:

```typescript
const Product = mongoose.model("Product", productSchema);

// Create
const laptop = await Product.create({ name: "Laptop", price: 999 });

// Query
const products = await Product.find({ price: { $gt: 100 } });

// Update
await Product.findByIdAndUpdate(id, { price: 899 });

// Delete
await Product.findByIdAndDelete(id);
```

## Common Queries

### Finding Documents

```typescript
// Find all
await Product.find();

// Find by condition
await Product.find({ category: "electronics" });

// Find one
await Product.findOne({ name: "Laptop" });

// Find by ID
await Product.findById(id);

// Select fields
await Product.find({}, "name price");

// Exclude fields
await Product.find({}, "-__v");
```

### Comparison Operators

```typescript
// Greater than
await Product.find({ price: { $gt: 100 } });

// Less than or equal
await Product.find({ stock: { $lte: 10 } });

// In array
await Product.find({ category: { $in: ["a", "b"] } });

// Not equal
await Product.find({ status: { $ne: "deleted" } });
```

### Logical Operators

```typescript
// AND (implicit)
await Product.find({ price: { $gt: 100 }, inStock: true });

// OR
await Product.find({
  $or: [{ price: { $gt: 1000 } }, { rating: { $gte: 4.5 } }],
});
```

### Text Search

```typescript
// Create text index
productSchema.index({ name: "text", description: "text" });

// Search
await Product.find({ $text: { $search: "laptop gaming" } });
```

## Updating Documents

### Update Methods

```typescript
// Find and update (returns old document by default)
const old = await Product.findByIdAndUpdate(id, { price: 799 });

// Find and update (returns new document)
const updated = await Product.findByIdAndUpdate(
  id,
  { price: 799 },
  { new: true },
);

// Update multiple
await Product.updateMany({ inStock: false }, { status: "outdated" });

// Update specific fields
await Product.findByIdAndUpdate(id, { $inc: { stock: -1 } });
```

### Update Operators

```typescript
// Increment
await Product.findByIdAndUpdate(id, { $inc: { stock: -1 } });

// Push to array
await Product.findByIdAndUpdate(id, { $push: { tags: "sale" } });

// Pull from array
await Product.findByIdAndUpdate(id, { $pull: { tags: "old" } });

// Set if not exists
await Product.findByIdAndUpdate(
  id,
  { $setOnInsert: { createdBy: userId } },
  { upsert: true },
);
```

## Deleting Documents

```typescript
// Delete by ID
await Product.findByIdAndDelete(id);

// Delete one matching
await Product.findOneAndDelete({ name: "Old Product" });

// Delete multiple
await Product.deleteMany({ inStock: false });
```

## Population (References)

Populate replaces ObjectIds with actual documents:

```typescript
// Define reference
const productSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: "Category" },
});

// Query with population
const product = await Product.findById(id).populate("category");

// Populate specific fields
await Product.findById(id).populate("category", "name slug");
```

## Middleware (Hooks)

Mongoose supports pre and post middleware:

```typescript
productSchema.pre("save", function (next) {
  // Before save
  if (this.isModified("price")) {
    console.log("Price changed to", this.price);
  }
  next();
});

productSchema.post("save", function (doc) {
  // After save
  console.log("Product saved:", doc.name);
});
```

## Indexes

Indexes improve query performance:

```typescript
// Single field
productSchema.index({ name: 1 });

// Compound index
productSchema.index({ category: 1, price: 1 });

// Text index
productSchema.index({ name: "text", description: "text" });

// Unique index
productSchema.index({ email: 1 }, { unique: true });
```

## Validation

Mongoose validates documents before saving:

```typescript
const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 1000000,
  },
  category: {
    type: String,
    enum: ["electronics", "clothing", "food"],
  },
});
```

## Virtuals

Virtuals are computed properties not stored in MongoDB:

```typescript
productSchema.virtual("discountedPrice").get(function () {
  return this.price * 0.9;
});

// Enable serialization
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });
```

## Timestamps

Automatic createdAt and updatedAt:

```typescript
const productSchema = new Schema(
  {
    name: String,
  },
  { timestamps: true },
);
```

## Mongoose in This Project

See the models in `src/models/`:

- `User.ts` - User model with timestamps
- `Product.ts` - Product with embedded reviews
- `Category.ts` - Category for product references
- `Order.ts` - Order with embedded items
