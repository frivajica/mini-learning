export declare class ProductService {
    getAll(options: {
        page: number;
        limit: number;
        search?: string;
        category?: string;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../models/Product.js").IProduct, {}, {}> & import("../models/Product.js").IProduct & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<any>;
    create(data: {
        name: string;
        description: string;
        price: number;
        category: string;
        tags?: string[];
        stock?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/Product.js").IProduct, {}, {}> & import("../models/Product.js").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        category?: string;
        tags?: string[];
        stock?: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/Product.js").IProduct, {}, {}> & import("../models/Product.js").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Product.js").IProduct, {}, {}> & import("../models/Product.js").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addReview(id: string, data: {
        author: string;
        rating: number;
        comment: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/Product.js").IProduct, {}, {}> & import("../models/Product.js").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private invalidateProductCache;
}
//# sourceMappingURL=productService.d.ts.map