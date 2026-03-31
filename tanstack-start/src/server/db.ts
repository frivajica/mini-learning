export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const users: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.bnhnT4aYwHOhWi", // Password123
    role: "ADMIN",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "user@example.com",
    name: "Regular User",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.bnhnT4aYwHOhWi", // Password123
    role: "USER",
    createdAt: new Date("2024-01-02"),
  },
];

const refreshTokens: RefreshToken[] = [];

export const db = {
  users: {
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findById: (id: string) => users.find((u) => u.id === id),
    existsByEmail: (email: string) => users.some((u) => u.email === email),
    create: (user: Omit<User, "id" | "createdAt">) => {
      const newUser: User = {
        ...user,
        id: String(users.length + 1),
        createdAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },
    getAll: () => users.map(({ password: _, ...user }) => user),
  },
  refreshTokens: {
    create: (userId: string) => {
      const token: RefreshToken = {
        id: String(refreshTokens.length + 1),
        token: crypto.randomUUID(),
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
      refreshTokens.push(token);
      return token;
    },
    findByToken: (token: string) =>
      refreshTokens.find((t) => t.token === token && t.expiresAt > new Date()),
    revoke: (token: string) => {
      const tokenRecord = refreshTokens.find((t) => t.token === token);
      if (tokenRecord) {
        tokenRecord.expiresAt = new Date(0);
      }
    },
    getUserByToken: (token: string) => {
      const tokenRecord = refreshTokens.find(
        (t) => t.token === token && t.expiresAt > new Date(),
      );
      if (!tokenRecord) return undefined;
      return users.find((u) => u.id === tokenRecord.userId);
    },
  },
};
