import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { GraphQLError } from "graphql";
import { randomUUID } from "crypto";
import type { Loaders } from "../loaders";
import { config } from "../config";

const SALT_ROUNDS = 10;

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { userId?: string }) => {
      if (!context.userId) return null;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, context.userId));
      return user || null;
    },

    users: async () => {
      return db.select().from(users);
    },

    user: async (_: unknown, { id }: { id: string }) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || null;
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: { email: string; password: string; name: string } },
    ) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
      if (existing.length > 0) {
        throw new GraphQLError("Email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
      const id = randomUUID();
      const now = new Date();

      await db.insert(users).values({
        id,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        createdAt: now,
      });

      const [user] = await db.select().from(users).where(eq(users.id, id));
      const token = jwt.sign({ userId: id }, config.jwtSecret, { expiresIn: "7d" });

      return { token, user };
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));
      if (!user) {
        throw new GraphQLError("Invalid credentials");
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new GraphQLError("Invalid credentials");
      }

      const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
        expiresIn: "7d",
      });

      return { token, user };
    },
  },

  User: {
    posts: async (
      parent: typeof users.$inferSelect,
      _: unknown,
      { loaders }: { loaders: Loaders },
    ) => {
      return loaders.postsByUserLoader.load(parent.id);
    },
  },
};
