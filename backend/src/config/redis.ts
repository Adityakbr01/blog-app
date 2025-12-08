import { createClient } from "redis";
import { env } from "@/config/env.js";
import logger from "@/utils/logger.js";

const redis = createClient({
    url: env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries: number) => {
            if (retries > 3) {
                logger.error("Redis connection failed after 3 retries");
                return new Error("Redis max retries reached");
            }
            return Math.min(retries * 200, 2000);
        },
    },
});

redis.on("connect", () => {
    logger.info("✅ Redis connecting...");
});

redis.on("ready", () => {
    logger.info("✅ Redis connected and ready");
});

redis.on("error", (err: Error) => {
    logger.error("Redis connection error:", err);
});

redis.on("end", () => {
    logger.warn("Redis connection closed");
});

// Connect to Redis
const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (error) {
        logger.error("Failed to connect to Redis:", error);
    }
};

connectRedis();

export default redis;
