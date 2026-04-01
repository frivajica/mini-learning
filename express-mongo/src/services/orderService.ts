import { Order, Product, IOrder } from "../models/index.js";
import { NotFoundError } from "../utils/AppError.js";

export class OrderService {
  async getAll(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userId: string) {
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    return order;
  }

  async create(
    userId: string,
    items: { productId: string; quantity: number }[],
  ) {
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    return order;
  }

  async updateStatus(id: string, status: IOrder["status"]) {
    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return order;
  }
}
