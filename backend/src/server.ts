import "@/config/env.js";
import app from "@/app.js";
import { env } from "@/config/env.js";
import logger from "@/utils/logger.js";
import { connectDB, disconnectDB } from "@/db/mongoDB.js";

const PORT = Number(env.PORT) || 5000;

async function startServer(port: number): Promise<void> {
  try {
    // ✅ Connect to MongoDB before starting the server
    await connectDB();

    const server = app.listen(port, () => {
      logger.info(`✅ Server running on port ${port} in ${env.NODE_ENV} mode`);
      if (env.NODE_ENV !== "development") {
        console.log(`✅ Server running on port ${port} in ${env.NODE_ENV} mode`);
      }
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.warn("SIGTERM received. Shutting down gracefully...");
      server.close(async () => {
        await disconnectDB();
        logger.info("Process terminated and DB disconnected!");
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.warn("SIGINT received. Shutting down gracefully...");
      server.close(async () => {
        await disconnectDB();
        logger.info("Process terminated and DB disconnected!");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    await disconnectDB();
    process.exit(1);
  }
}

startServer(PORT);
