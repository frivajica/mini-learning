# Authentication

JWT-based authentication in GraphQL.

## How It Works

```
1. User registers/logins → receives JWT token
2. Token stored in localStorage
3. Token sent with every request via Authorization header
4. Backend verifies token and adds userId to context
5. Protected resolvers check context.userId
```

---

## Backend Implementation

### JWT Secret

```typescript
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
```

**Production:** Always use environment variable!

### Registration

```typescript
Mutation: {
  register: async (_, { input }) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    await db.insert(users).values({
      id: randomUUID(),
      email: input.email,
      password: hashedPassword,
      name: input.name,
      createdAt: new Date(),
    });

    // Generate token
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });

    return { token, user };
  },
}
```

### Login

```typescript
Mutation: {
  login: async (_, { input }) => {
    const [user] = await db.select().from(users).where(eq(users.email, input.email));

    // Verify password
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new GraphQLError('Invalid credentials');

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return { token, user };
  },
}
```

### Context Extraction

```typescript
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      let userId;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          userId = decoded.userId;
        } catch {
          // Invalid token - userId remains undefined
        }
      }

      return { userId, loaders };
    },
  }),
);
```

### Protected Resolvers

```typescript
Mutation: {
  createPost: async (_, { input }, context) => {
    if (!context.userId) {
      throw new GraphQLError('Not authenticated');
    }
    // Proceed with creation using context.userId
  },
}
```

---

## Frontend Implementation

### Apollo Client Headers

```typescript
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  headers: {
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});
```

### WebSocket Connection

```typescript
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
    connectionParams: () => ({
      authorization: localStorage.getItem("token")
        ? `Bearer ${localStorage.getItem("token")}`
        : {},
    }),
  }),
);
```

### Zustand Auth Store

```typescript
// frontend/src/lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" },
  ),
);
```

### Using Auth in Components

```typescript
import { useAuthStore } from '@/lib/store';

function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
```

---

## Security Best Practices

| Practice              | Implementation                                   |
| --------------------- | ------------------------------------------------ |
| **Password Hashing**  | bcrypt with 10 salt rounds                       |
| **Token Expiry**      | 7 days (configurable)                            |
| **HTTPS Only**        | Use in production                                |
| **Secret Management** | Environment variables                            |
| **Token Storage**     | httpOnly cookies (more secure than localStorage) |

---

## Environment Variables

```bash
# backend/.env
JWT_SECRET=your-secure-secret-key
DATABASE_URL=./data.db
PORT=4000
```

**Note:** For production, consider:

- Longer JWT secrets (32+ characters)
- Refresh tokens
- httpOnly cookies for token storage
