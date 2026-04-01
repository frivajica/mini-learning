import { Product } from "../models/index.js";
import { NotFoundError } from "../utils/AppError.js";
import { redis } from "../config/redis.js";
const PRODUCT_CACHE_TTL = 300;
export class ProductService {
    async getAll(options) {
        const { page, limit, search, category } = options;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        const [products, total] = await Promise.all([
            Product.find(query)
                .skip(skip)
                .limit(limit)
                .populate("category", "name slug"),
            Product.countDocuments(query),
        ]);
        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getById(id) {
        const cacheKey = `product:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const product = await Product.findById(id).populate("category", "name slug");
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        await redis.setex(cacheKey, PRODUCT_CACHE_TTL, JSON.stringify(product));
        return product;
    }
    async create(data) {
        const product = await Product.create({
            ...data,
            tags: data.tags || [],
            stock: data.stock ?? 0,
        });
        await this.invalidateProductCache();
        return product;
    }
    async update(id, data) {
        const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).populate("category", "name slug");
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        await this.invalidateProductCache(id);
        return product;
    }
    async delete(id) {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        await this.invalidateProductCache(id);
        return product;
    }
    async addReview(id, data) {
        const product = await Product.findById(id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        product.reviews.push({ ...data, createdAt: new Date() });
        await product.save();
        await this.invalidateProductCache(id);
        return product;
    }
    async invalidateProductCache(_id) {
        const keys = [];
        const productKeys = await redis.keys("product:*");
        keys.push(...productKeys);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    }
}
//# sourceMappingURL=productService.js.map