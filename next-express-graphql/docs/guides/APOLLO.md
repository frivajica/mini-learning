# Apollo Guide

Apollo Server & Client setup in this project.

## Apollo Server 4 (Backend)

### Server Setup

```typescript
// backend/src/index.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({ schema });
await server.start();

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace("Bearer ", "");
      // Return context for all resolvers
      return { userId, loaders };
    },
  }),
);
```

### Adding Context

Context is shared across all resolvers:

```typescript
context: async ({ req }) => {
  const userId = await getUserId(req); // null if not logged in
  return { userId, loaders };
};

// In resolver:
Query: {
  posts: async (_, __, context) => {
    // context.userId available
    // context.loaders available
  };
}
```

### Schema & Resolvers

```typescript
// Type definitions
export const typeDefs = `#graphql
  type Query {
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String!
  }
`;

// Resolvers
export const resolvers = {
  Query: {
    posts: async () => db.select().from(posts),
  },
};
```

---

## Apollo Client 4 (Frontend)

### Split Link Setup

Routes queries/mutations via HTTP, subscriptions via WebSocket:

```typescript
// frontend/src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

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

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### Using Queries

```typescript
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '@/lib/queries';

function PostsPage() {
  const { data, loading, error, refetch } = useQuery(GET_POSTS, {
    variables: { offset: 0, limit: 10 },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.posts.items.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Using Mutations

```typescript
import { useMutation } from "@apollo/client";
import { LOGIN } from "@/lib/mutations";

function LoginForm() {
  const [login] = useMutation(LOGIN);

  const handleLogin = async (email, password) => {
    const { data } = await login({
      variables: { input: { email, password } },
    });
    localStorage.setItem("token", data.login.token);
  };
}
```

### Using Subscriptions

```typescript
import { useSubscription } from "@apollo/client";
import { STOCK_UPDATED_SUBSCRIPTION } from "@/lib/queries";

function ProductsPage() {
  const { data } = useSubscription(STOCK_UPDATED_SUBSCRIPTION);

  useEffect(() => {
    if (data?.stockUpdated) {
      // Update local product list
      updateProductStock(data.stockUpdated);
    }
  }, [data]);
}
```

---

## Apollo Client Features

| Feature                | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| **Split Link**         | Routes by operation type (query/mutation vs subscription) |
| **InMemoryCache**      | Automatic caching & cache updates                         |
| **Reactive Variables** | Local state management                                    |
| **Polling**            | Periodic refetching                                       |
| **Fetch Policy**       | Control cache behavior per query                          |

### Fetch Policies

```typescript
// Default: cache-first
useQuery(GET_POSTS, { fetchPolicy: "cache-first" });

// Network only
useQuery(GET_POSTS, { fetchPolicy: "network-only" });

// Cache and network
useQuery(GET_POSTS, { fetchPolicy: "cache-and-network" });
```

---

## Provider Setup

Wrap your app with ApolloProvider:

```typescript
// frontend/src/app/layout.tsx
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';

export default function RootLayout({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
```

---

## GraphQL Code Generation

Generate TypeScript types from schema:

```bash
npm install -D graphql-codegen
npx graphql-codegen init
```

---

## Next Steps

- See [API Reference](../API.md) for available queries/mutations
- See [DataLoader Guide](./DATALOADER.md) for N+1 prevention
