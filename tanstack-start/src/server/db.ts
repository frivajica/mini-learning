import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "mini.db");

const dbDir = path.dirname(DB_PATH);

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    initializeSchema(_db);
  }
  return _db;
}

function initializeSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  const userCount = database
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase(database);
  }
}

function seedDatabase(database: Database.Database) {
  const adminPassword = bcrypt.hashSync("Password123", 12);
  const userPassword = bcrypt.hashSync("Password123", 12);

  const insertUser = database.prepare(`
    INSERT INTO users (id, email, name, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    "1",
    "admin@example.com",
    "Admin User",
    adminPassword,
    "ADMIN",
    new Date("2024-01-01").toISOString(),
  );
  insertUser.run(
    "2",
    "user@example.com",
    "Regular User",
    userPassword,
    "USER",
    new Date("2024-01-02").toISOString(),
  );
}

export const db = {
  users: {
    findByEmail: (email: string): User | undefined => {
      const stmt = getDb().prepare("SELECT * FROM users WHERE email = ?");
      return stmt.get(email) as User | undefined;
    },

    findById: (id: string): User | undefined => {
      const stmt = getDb().prepare("SELECT * FROM users WHERE id = ?");
      return stmt.get(id) as User | undefined;
    },

    existsByEmail: (email: string): boolean => {
      const stmt = getDb().prepare("SELECT 1 FROM users WHERE email = ?");
      return stmt.get(email) !== undefined;
    },

    create: (user: Omit<User, "id" | "createdAt">): User => {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const stmt = getDb().prepare(`
        INSERT INTO users (id, email, name, password, role, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, user.email, user.name, user.password, user.role, createdAt);
      return { id, ...user, createdAt };
    },

    getAll: (): Omit<User, "password">[] => {
      const stmt = getDb().prepare(
        "SELECT id, email, name, role, createdAt FROM users",
      );
      return stmt.all() as Omit<User, "password">[];
    },
  },

  refreshTokens: {
    create: (userId: string): RefreshToken => {
      const id = crypto.randomUUID();
      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const createdAt = new Date().toISOString();

      const stmt = getDb().prepare(`
        INSERT INTO refresh_tokens (id, token, userId, expiresAt, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(id, token, userId, expiresAt, createdAt);

      return { id, token, userId, expiresAt, createdAt };
    },

    findByToken: (token: string): RefreshToken | undefined => {
      const stmt = getDb().prepare(`
        SELECT * FROM refresh_tokens 
        WHERE token = ? AND expiresAt > datetime('now')
      `);
      return stmt.get(token) as RefreshToken | undefined;
    },

    revoke: (token: string): void => {
      const stmt = getDb().prepare(
        "DELETE FROM refresh_tokens WHERE token = ?",
      );
      stmt.run(token);
    },

    getUserByToken: (token: string): Omit<User, "password"> | undefined => {
      const tokenRecord = db.refreshTokens.findByToken(token);
      if (!tokenRecord) return undefined;

      const stmt = getDb().prepare(
        "SELECT id, email, name, role, createdAt FROM users WHERE id = ?",
      );
      return stmt.get(tokenRecord.userId) as Omit<User, "password"> | undefined;
    },
  },

  close: () => {
    if (_db) {
      _db.close();
      _db = null;
    }
  },
};
