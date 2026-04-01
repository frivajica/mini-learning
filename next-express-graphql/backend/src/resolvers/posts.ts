import { db } from "../db";
import { posts, users, comments } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { randomUUID } from "crypto";
import type { Loaders } from "../loaders";

export const postResolvers = {
  Query: {
    posts: async (
      _: unknown,
      { offset = 0, limit = 10 }: { offset?: number; limit?: number },
    ) => {
      const items = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts);
      return {
        items,
        totalCount: count,
        hasMore: offset + items.length < count,
      };
    },

    post: async (_: unknown, { id }: { id: string }) => {
      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      return post || null;
    },
  },

  Mutation: {
    createPost: async (
      _: unknown,
      { input }: { input: { title: string; content: string } },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const id = randomUUID();
      const now = new Date();

      await db.insert(posts).values({
        id,
        title: input.title,
        content: input.content,
        authorId: context.userId,
        createdAt: now,
        updatedAt: now,
      });

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      return post;
    },

    updatePost: async (
      _: unknown,
      {
        id,
        input,
      }: { id: string; input: { title?: string; content?: string } },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      if (!post) return null;
      if (post.authorId !== context.userId) {
        throw new GraphQLError("Not authorized");
      }

      await db
        .update(posts)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id));

      const [updated] = await db.select().from(posts).where(eq(posts.id, id));
      return updated;
    },

    deletePost: async (
      _: unknown,
      { id }: { id: string },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [post] = await db.select().from(posts).where(eq(posts.id, id));
      if (!post) return false;
      if (post.authorId !== context.userId) {
        throw new GraphQLError("Not authorized");
      }

      await db.delete(comments).where(eq(comments.postId, id));
      await db.delete(posts).where(eq(posts.id, id));
      return true;
    },
  },

  Post: {
    author: async (
      parent: typeof posts.$inferSelect,
      _: unknown,
      { loaders }: { loaders: Loaders },
    ) => {
      return loaders.userLoader.load(parent.authorId);
    },

    comments: async (
      parent: typeof posts.$inferSelect,
      _: unknown,
      { loaders }: { loaders: Loaders },
    ) => {
      return loaders.commentsByPostLoader.load(parent.id);
    },
  },
};
