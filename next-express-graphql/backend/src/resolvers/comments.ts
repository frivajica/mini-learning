import { db } from "../db";
import { comments } from "../db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { randomUUID } from "crypto";
import type { Loaders } from "../loaders";

export const commentResolvers = {
  Query: {
    comments: async (_: unknown, { postId }: { postId: string }) => {
      return db.select().from(comments).where(eq(comments.postId, postId));
    },
  },

  Mutation: {
    createComment: async (
      _: unknown,
      { input }: { input: { postId: string; content: string } },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const id = randomUUID();
      const now = new Date();

      await db.insert(comments).values({
        id,
        content: input.content,
        postId: input.postId,
        authorId: context.userId,
        createdAt: now,
      });

      const [comment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id));
      return comment;
    },

    deleteComment: async (
      _: unknown,
      { id }: { id: string },
      context: { userId?: string },
    ) => {
      if (!context.userId) {
        throw new GraphQLError("Not authenticated");
      }

      const [comment] = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id));
      if (!comment) return false;
      if (comment.authorId !== context.userId) {
        throw new GraphQLError("Not authorized");
      }

      await db.delete(comments).where(eq(comments.id, id));
      return true;
    },
  },

  Comment: {
    author: async (
      parent: typeof comments.$inferSelect,
      _: unknown,
      { loaders }: { loaders: Loaders },
    ) => {
      return loaders.userLoader.load(parent.authorId);
    },

    post: async (
      parent: typeof comments.$inferSelect,
      _: unknown,
      { loaders }: { loaders: Loaders },
    ) => {
      return loaders.postLoader.load(parent.postId);
    },
  },
};
