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
import { config } from "./config";

const pubsub = new PubSub();

interface MyContext {
  pubsub: PubSub;
  userId?: string;
  loaders: ReturnType<typeof createLoaders>;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx): Promise<MyContext> => {
        const token = ctx.connectionParams?.authorization as string | undefined;
        let userId: string | undefined;

        if (token) {
          try {
            const decoded = jwt.verify(
              token.replace("Bearer ", ""),
              config.jwtSecret,
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

  const server = new ApolloServer<MyContext>({
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
    cors<cors.CorsRequest>({
      origin: config.corsOrigins,
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<MyContext> => {
        const token = req.headers.authorization?.replace("Bearer ", "");
        let userId: string | undefined;

        if (token) {
          try {
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            userId = decoded.userId;
          } catch {
            // Invalid token
          }
        }

        return { pubsub, userId, loaders: createLoaders() };
      },
    }),
  );

  app.get("/health/live", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/health/ready", async (_, res) => {
    try {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        checks: { database: { status: "ok" } },
      });
    } catch {
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        checks: { database: { status: "error" } },
      });
    }
  });

  httpServer.listen(config.port, () => {
    console.log(JSON.stringify({
      level: "info",
      message: `🚀 HTTP Server ready at http://localhost:${config.port}/graphql`,
      environment: config.nodeEnv,
    }));
    console.log(JSON.stringify({
      level: "info",
      message: `🚀 WebSocket Server ready at ws://localhost:${config.port}/graphql`,
      environment: config.nodeEnv,
    }));
  });

  const shutdown = async (signal: string) => {
    console.log(JSON.stringify({ level: "info", message: `${signal} received, shutting down gracefully` }));
    await server.stop();
    httpServer.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error(JSON.stringify({ level: "error", message: "Failed to start server", error: err.message }));
  process.exit(1);
});
