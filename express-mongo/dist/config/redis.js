import Redis from "ioredis";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";
const MAX_RECONNECT_ATTEMPTS = 10;
export const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: true,
    retryStrategy: (retries) => {
        if (retries > MAX_RECONNECT_ATTEMPTS) {
            logger.error("Redis max reconnection attempts reached");
            return null;
        }
        const delay = Math.min(retries * 100, 3000);
        return delay;
    },
});
redis.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
});
redis.on("connect", () => {
    logger.info("Redis connected");
});
export async function connectRedis() {
    await redis.connect();
}
export async function disconnectRedis() {
    await redis.quit();
}
//# sourceMappingURL=redis.js.map