import mongoose from "mongoose";
import { env } from "@/config/env.js";
import logger from "@/utils/logger.js";

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info("✅ MongoDB connected successfully");
    } catch (error) {
        logger.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
};

mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
});

export default mongoose;
