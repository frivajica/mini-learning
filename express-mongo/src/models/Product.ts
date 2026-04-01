import mongoose, { Document, Schema } from "mongoose";

export interface IReview {
  author: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  tags: string[];
  stock: number;
  reviews: IReview[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });

productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  } else {
    this.averageRating = 0;
  }
  next();
});

export const Product = mongoose.model<IProduct>("Product", productSchema);
