import { Product } from "../models/index.js";
import { NotFoundError } from "../utils/AppError.js";
import { redis } from "../config/redis.js";

const PRODUCT_CACHE_TTL = 300;

export class ProductService {
  async getAll(options: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
  }) {
    const { page, limit, search, category } = options;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
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

  async getById(id: string) {
    const cacheKey = `product:${id}`;
    const CACHE_SET_KEY = "cache:product:keys";
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const product = await Product.findById(id).populate(
      "category",
      "name slug",
    );
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await redis.setex(cacheKey, PRODUCT_CACHE_TTL, JSON.stringify(product));
    await redis.sadd(CACHE_SET_KEY, cacheKey);

    return product;
  }

  async create(data: {
    name: string;
    description: string;
    price: number;
    category: string;
    tags?: string[];
    stock?: number;
  }) {
    const product = await Product.create({
      ...data,
      tags: data.tags || [],
      stock: data.stock ?? 0,
    });

    await this.invalidateProductCache();

    return product;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      tags?: string[];
      stock?: number;
    },
  ) {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).populate("category", "name slug");

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.invalidateProductCache(id);

    return product;
  }

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.invalidateProductCache(id);

    return product;
  }

  async addReview(
    id: string,
    data: { author: string; rating: number; comment: string },
  ) {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    product.reviews.push({ ...data, createdAt: new Date() });
    await product.save();

    await this.invalidateProductCache(id);

    return product;
  }

  private async invalidateProductCache(_id?: string) {
    const CACHE_SET_KEY = "cache:product:keys";

    if (_id) {
      await redis.srem(CACHE_SET_KEY, `product:${_id}`);
    }

    const cachedKeys = await redis.smembers(CACHE_SET_KEY);
    if (cachedKeys.length > 0) {
      await redis.del(...cachedKeys);
    }
    await redis.del(CACHE_SET_KEY);
  }
}
