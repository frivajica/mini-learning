import DataLoader from "dataloader";
import { db } from "../db";
import { users, posts, comments } from "../db/schema";
import { inArray } from "drizzle-orm";

export const createLoaders = () => ({
  userLoader: new DataLoader<string, typeof users.$inferSelect | null>(
    async (ids) => {
      const allUsers = await db
        .select()
        .from(users)
        .where(inArray(users.id, [...ids]));
      const userMap = new Map(allUsers.map((u) => [u.id, u]));
      return ids.map((id) => userMap.get(id) || null);
    },
  ),

  postLoader: new DataLoader<string, typeof posts.$inferSelect | null>(
    async (ids) => {
      const allPosts = await db
        .select()
        .from(posts)
        .where(inArray(posts.id, [...ids]));
      const postMap = new Map(allPosts.map((p) => [p.id, p]));
      return ids.map((id) => postMap.get(id) || null);
    },
  ),

  commentsByPostLoader: new DataLoader<string, (typeof comments.$inferSelect)[]>(
    async (postIds) => {
      const allComments = await db
        .select()
        .from(comments)
        .where(inArray(comments.postId, [...postIds]));
      const grouped = new Map<string, (typeof comments.$inferSelect)[]>();
      for (const comment of allComments) {
        if (!grouped.has(comment.postId)) {
          grouped.set(comment.postId, []);
        }
        grouped.get(comment.postId)!.push(comment);
      }
      return postIds.map((id) => grouped.get(id) || []);
    },
  ),

  postsByUserLoader: new DataLoader<string, (typeof posts.$inferSelect)[]>(
    async (userIds) => {
      const allPosts = await db
        .select()
        .from(posts)
        .where(inArray(posts.authorId, [...userIds]));
      const grouped = new Map<string, (typeof posts.$inferSelect)[]>();
      for (const post of allPosts) {
        if (!grouped.has(post.authorId)) {
          grouped.set(post.authorId, []);
        }
        grouped.get(post.authorId)!.push(post);
      }
      return userIds.map((id) => grouped.get(id) || []);
    },
  ),
});

export type Loaders = ReturnType<typeof createLoaders>;
