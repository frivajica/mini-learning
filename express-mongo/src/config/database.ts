import mongoose from "mongoose";
import { config } from "./index.js";
import { logger } from "../utils/logger.js";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

export async function connectDatabase() {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info("MongoDB connected");
      return;
    } catch (error) {
      lastError = error as Error;
      logger.warn(
        { attempt, maxRetries: MAX_RETRIES, error: lastError.message },
        "MongoDB connection attempt failed",
      );

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error({ error: lastError }, "MongoDB connection failed after all retries");
  throw lastError;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});
