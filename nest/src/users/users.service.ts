import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from '../database/database.module';
import { users, User } from '../database/schema';
import { eq, desc, sql, like, asc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, PaginationDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: any,
    private configService: ConfigService,
  ) {}

  private sanitizeSearchInput(search: string): string {
    return search.replace(/[%_]/g, '\\$&');
  }

  async findAll(pagination: PaginationDto) {
    const page = Math.max(1, parseInt(pagination.page as string) || 1);
    const limit = Math.min(
      Math.max(1, parseInt(pagination.limit as string) || 10),
      100,
    );
    const search = pagination.search;
    const offset = (page - 1) * limit;

    const sanitizedSearch = search ? this.sanitizeSearchInput(search) : undefined;
    const where = sanitizedSearch
      ? like(users.name, `%${sanitizedSearch}%`)
      : undefined;

    const [data, total] = await Promise.all([
      this.db.select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: sql<number>`count(*)`.as('count') })
        .from(users)
        .where(where),
    ]);

    return {
      data: data.map((u: User) => this.sanitizeUser(u)),
      meta: {
        total: total[0]?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((total[0]?.count || 0) / limit),
      },
    };
  }

  async findById(id: number) {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    const user = result[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  async create(data: CreateUserDto) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      this.configService.get<number>('BCRYPT_ROUNDS') || 10,
    );

    const result = await this.db.insert(users).values({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'USER',
    }).returning();

    return this.sanitizeUser(result[0]);
  }

  async update(id: number, data: UpdateUserDto, currentUser?: { id: number; role: string }) {
    const updateData = { ...data };
    delete updateData.role;

    if (Object.keys(updateData).length === 0) {
      throw new NotFoundException('No valid fields to update');
    }

    const result = await this.db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const user = result[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateRole(id: number, role: string) {
    if (!['USER', 'ADMIN'].includes(role)) {
      throw new ConflictException('Invalid role');
    }

    const result = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const user = result[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async delete(id: number) {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    const user = result[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
