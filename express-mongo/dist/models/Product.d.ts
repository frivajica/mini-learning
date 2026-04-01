import mongoose, { Document } from "mongoose";
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
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map