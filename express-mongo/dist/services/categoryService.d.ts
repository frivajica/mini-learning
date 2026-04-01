export declare class CategoryService {
    getAll(): Promise<any>;
    getById(id: string): Promise<any>;
    getBySlug(slug: string): Promise<any>;
    create(data: {
        name: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/Category.js").ICategory, {}, {}> & import("../models/Category.js").ICategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/Category.js").ICategory, {}, {}> & import("../models/Category.js").ICategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Category.js").ICategory, {}, {}> & import("../models/Category.js").ICategory & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private invalidateCategoryCache;
}
//# sourceMappingURL=categoryService.d.ts.map