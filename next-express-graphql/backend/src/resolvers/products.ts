import { db } from "../db";
import { products } from "../db/schema";
import { eq, desc, sql, gt, lt, and, or } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { randomUUID } from "crypto";
import type { PubSub } from "graphql-subscriptions";

export const PRODUCT_UPDATED = "PRODUCT_UPDATED";

export const productResolvers = {
  Query: {
    products: async (
      _: unknown,
      { cursor, limit = 10 }: { cursor?: string; limit?: number },
    ) => {
      const items = cursor
        ? await db
            .select()
            .from(products)
            .where(lt(products.id, cursor))
            .orderBy(desc(products.createdAt))
            .limit(limit)
        : await db
            .select()
            .from(products)
            .orderBy(desc(products.createdAt))
            .limit(limit);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products);
      const lastItem = items[items.length - 1];

      return {
        items,
        totalCount: count,
        hasMore: items.length === limit,
        cursor: lastItem?.id,
      };
    },

    product: async (_: unknown, { id }: { id: string }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return product || null;
    },
  },

  Mutation: {
    createProduct: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          name: string;
          description?: string;
          price: number;
          stock: number;
        };
      },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const id = randomUUID();
      const now = new Date();

      await db.insert(products).values({
        id,
        name: input.name,
        description: input.description,
        price: input.price,
        stock: input.stock,
        createdAt: now,
        updatedAt: now,
      });

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return product;
    },

    updateProduct: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          name?: string;
          description?: string;
          price?: number;
          stock?: number;
        };
      },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      if (!product) return null;

      await db
        .update(products)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.stock !== undefined && { stock: input.stock }),
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));

      const [updated] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      return updated;
    },

    deleteProduct: async (
      _: unknown,
      { id }: { id: string },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      if (!product) return false;

      await db.delete(products).where(eq(products.id, id));
      return true;
    },

    updateStock: async (
      _: unknown,
      { id, stock }: { id: string; stock: number },
      context: { userId?: string; pubsub: PubSub },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));
      if (!product) return null;

      await db
        .update(products)
        .set({ stock, updatedAt: new Date() })
        .where(eq(products.id, id));

      const [updated] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      context.pubsub.publish(PRODUCT_UPDATED, { stockUpdated: updated });

      return updated;
    },
  },

  Subscription: {
    stockUpdated: {
      subscribe: (_: unknown, __: unknown, context: { pubsub: PubSub }) => {
        return context.pubsub.asyncIterator([PRODUCT_UPDATED]);
      },
    },
  },

  Product: {},
};
