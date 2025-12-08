import morgan, { StreamOptions } from "morgan";
import logger from "@/utils/logger.js";
import { env } from "@/config/env.js";

// Stream for Morgan to redirect logs to Winston
const stream: StreamOptions = {
  write: (message: string) => {
    // Remove trailing newline from morgan
    logger.http(message.trim());
  },
};

// Skip logging for tests or static files
const skip = () => env.NODE_ENV === "test";

// Define morgan format per environment
const format = env.NODE_ENV === "production" ? "combined" : "dev";

// Export middleware
export const httpLogger = morgan(format, { stream, skip });
