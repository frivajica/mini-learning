import express from "express";
import cors from "cors";
import { createServer } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import jwt from "jsonwebtoken";
import { PubSub } from "graphql-subscriptions";

import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./resolvers";
import { createLoaders } from "./loaders";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const pubsub = new PubSub();

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authorization as string | undefined;
        let userId: string | undefined;

        if (token) {
          try {
            const decoded = jwt.verify(
              token.replace("Bearer ", ""),
              JWT_SECRET,
            ) as { userId: string };
            userId = decoded.userId;
          } catch {
            // Invalid token
          }
        }

        return { pubsub, userId, loaders: createLoaders() };
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace("Bearer ", "");
        let userId: string | undefined;

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
          } catch {
            // Invalid token
          }
        }

        return { pubsub, userId, loaders: createLoaders() };
      },
    }),
  );

  httpServer.listen(PORT, () => {
    console.log(`🚀 HTTP Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 WebSocket Server ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
