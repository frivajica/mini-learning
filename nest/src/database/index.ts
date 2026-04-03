export * from './schema';
export * from './database.module';
import type { drizzle } from 'drizzle-orm/postgres-js';

export type Database = ReturnType<typeof drizzle>;
