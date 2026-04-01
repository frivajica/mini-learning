import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const FORCE_SHUTDOWN_TIMEOUT_MS = 10000;

async function main() {
  try {
    await connectDatabase();
    logger.info("MongoDB connected");

    await connectRedis();
    logger.info("Redis connected");

    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      server.close(async () => {
        try {
          await disconnectRedis();
          await disconnectDatabase();
          logger.info("All connections closed");
          process.exit(0);
        } catch (error) {
          logger.error({ error }, "Error during shutdown");
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, FORCE_SHUTDOWN_TIMEOUT_MS);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.fatal({ error }, "Failed to start server");
    process.exit(1);
  }
}

main();
