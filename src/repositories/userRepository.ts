import { db } from '../db/index.js';
import { users, NewUser } from '../db/schema.js';
import { eq, desc, sql, like, asc } from 'drizzle-orm';
import { IUserRepository } from '../types/interfaces/repositories.js';

function sanitizeSearchInput(search: string): string {
  return search.replace(/[%_]/g, '\\$&');
}

export class UserRepository implements IUserRepository {
  async findAll(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    const offsetVal = (page - 1) * limit;

    const sanitizedSearch = search ? sanitizeSearchInput(search) : undefined;
    const where = sanitizedSearch
      ? like(users.name, `%${sanitizedSearch}%`)
      : undefined;

    const [data, total] = await Promise.all([
      db.select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offsetVal),
      db.select({ count: sql<number>`count(*)`.as('count') })
        .from(users)
        .where(where),
    ]);

    return {
      data,
      total: total[0]?.count || 0,
    };
  }

  async findById(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async findByRole(role: string) {
    const result = await db.select().from(users).where(eq(users.role, role)).orderBy(asc(users.createdAt));
    return result;
  }

  async create(data: NewUser) {
    const result = await db.insert(users).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewUser>) {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  }

  async count() {
    const result = await db.select({ count: sql<number>`count(*)`.as('count') }).from(users);
    return result[0]?.count || 0;
  }
}
