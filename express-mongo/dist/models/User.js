import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map