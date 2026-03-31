import { pgTable, serial, varchar, timestamp, boolean, text, integer, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('USER'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    roleIdx: index('idx_users_role').on(table.role),
    createdAtIdx: index('idx_users_created_at').on(table.createdAt),
    emailIdx: index('idx_users_email').on(table.email),
  };
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    tokenIdx: index('idx_refresh_tokens_token').on(table.token),
    userIdIdx: index('idx_refresh_tokens_user_id').on(table.userId),
    expiresAtIdx: index('idx_refresh_tokens_expires_at').on(table.expiresAt),
  };
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').notNull().references(() => users.id),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    authorIdIdx: index('idx_posts_author_id').on(table.authorId),
    publishedIdx: index('idx_posts_published').on(table.published),
    createdAtIdx: index('idx_posts_created_at').on(table.createdAt),
  };
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
