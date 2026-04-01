import mongoose, { Schema } from "mongoose";
const reviewSchema = new Schema({
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.pre("save", function (next) {
    if (this.reviews && this.reviews.length > 0) {
        const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
    }
    else {
        this.averageRating = 0;
    }
    next();
});
export const Product = mongoose.model("Product", productSchema);
//# sourceMappingURL=Product.js.map