import { Category } from "../models/index.js";
import { NotFoundError, ConflictError } from "../utils/AppError.js";
import { redis } from "../config/redis.js";
const CATEGORY_CACHE_TTL = 600;
export class CategoryService {
    async getAll() {
        const cacheKey = "categories:all";
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const categories = await Category.find().sort({ name: 1 });
        await redis.setex(cacheKey, CATEGORY_CACHE_TTL, JSON.stringify(categories));
        return categories;
    }
    async getById(id) {
        const cacheKey = `category:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const category = await Category.findById(id);
        if (!category) {
            throw new NotFoundError("Category not found");
        }
        await redis.setex(cacheKey, CATEGORY_CACHE_TTL, JSON.stringify(category));
        return category;
    }
    async getBySlug(slug) {
        const cacheKey = `category:slug:${slug}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const category = await Category.findOne({ slug });
        if (!category) {
            throw new NotFoundError("Category not found");
        }
        await redis.setex(cacheKey, CATEGORY_CACHE_TTL, JSON.stringify(category));
        return category;
    }
    async create(data) {
        const slug = data.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .slice(0, 100);
        const existing = await Category.findOne({ slug });
        if (existing) {
            throw new ConflictError("Category with this name already exists");
        }
        const category = await Category.create({
            name: data.name,
            slug,
            description: data.description || "",
        });
        await this.invalidateCategoryCache();
        return category;
    }
    async update(id, data) {
        const category = await Category.findById(id);
        if (!category) {
            throw new NotFoundError("Category not found");
        }
        if (data.name && data.name !== category.name) {
            const newSlug = data.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
                .slice(0, 100);
            const existing = await Category.findOne({
                slug: newSlug,
                _id: { $ne: id },
            });
            if (existing) {
                throw new ConflictError("Category with this name already exists");
            }
            category.slug = newSlug;
            category.name = data.name;
        }
        if (data.description !== undefined) {
            category.description = data.description;
        }
        await category.save();
        await this.invalidateCategoryCache(id);
        return category;
    }
    async delete(id) {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new NotFoundError("Category not found");
        }
        await this.invalidateCategoryCache(id);
        return category;
    }
    async invalidateCategoryCache(id) {
        const keys = ["categories:all"];
        if (id) {
            keys.push(`category:${id}`);
        }
        const slugKeys = await redis.keys("category:slug:*");
        keys.push(...slugKeys);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
}
//# sourceMappingURL=categoryService.js.map