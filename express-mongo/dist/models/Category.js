import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
}, { timestamps: true });
categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });
export const Category = mongoose.model("Category", categorySchema);
//# sourceMappingURL=Category.js.map