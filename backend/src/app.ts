import dotenv from "dotenv";
import express from "express";
import middlewares from "@/middlewares/system/index.js";
import { asyncWrap } from "./utils/asyncWrap.js";
import { sendResponse } from "./utils/sendResponse.js";
import {
  API_PREFIX,
  API_ROUTES,
  APP_CONSTANTS,
  HTTP_MESSAGES,
  HTTP_STATUS,
} from "./constants/api.constants.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import categoryRoutes from "./routes/category.route.js";
import { notFoundHandler } from "./middlewares/system/notFound.js";
import { globalErrorHandler } from "./middlewares/system/errorHandler.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middlewares
middlewares.forEach((middleware) => app.use(middleware));

// Health Check Endpoint
app.get(
  "/health",
  asyncWrap(async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "Connected" : "Disconnected";

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      HTTP_MESSAGES.SUCCESS,
      { status: "Healthy" },
      {
        database: dbStatus,
      },
      process.env.NODE_ENV,
    );
  }),
);

app.get("/", (req, res) => {
  return sendResponse(res, HTTP_STATUS.OK, "Welcome to the Blog App API", {
    appName: APP_CONSTANTS.APP_NAME,
    version: APP_CONSTANTS.APP_VERSION,
  });
});

// ---- API Routes ----
app.use(API_PREFIX + API_ROUTES.AUTH, authRoutes);
app.use(API_PREFIX + API_ROUTES.BLOG, postRoutes);
app.use(API_PREFIX + API_ROUTES.COMMENT, commentRoutes);
app.use(API_PREFIX + API_ROUTES.USER, userRoutes);
app.use(API_PREFIX + API_ROUTES.CATEGORY, categoryRoutes);
app.use(API_PREFIX + API_ROUTES.ADMIN, adminRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
