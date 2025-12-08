import dotenv from "dotenv";
import { z } from "zod";

const NODE_ENV = process.env.NODE_ENV || "development";

// Load .env file - in production on platforms like Render, this file won't exist
// but that's okay since env vars are set directly. Locally, it loads .env.{NODE_ENV}
const result = dotenv.config();

console.log("🔍 DEBUG: Loading env file for NODE_ENV:", NODE_ENV);
console.log("🔍 DEBUG: Dotenv result:", result.error ? result.error.message : "OK");
console.log("🔍 DEBUG: MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("🔍 DEBUG: JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("🔍 DEBUG: SMTP_FROM value:", process.env.SMTP_FROM);

// ✅ ZOD SCHEMA
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().min(1000).max(65535).default(5000).describe("Port number for the server"),
  MONGO_URI: z.string().min(10).describe("MongoDB connection string"),
  REDIS_URL: z.string().default("redis://localhost:6379").describe("Redis connection string"),
  JWT_SECRET: z.string().min(10).describe("Secret key for signing JWT tokens"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m").describe("Access token expiry duration"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d").describe("Refresh token expiry duration"),
  SALT_ROUNDS: z.coerce.number().default(12).describe("Number of salt rounds for bcrypt"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10).describe("OTP validity duration in minutes"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).describe("Cloudinary cloud name"),
  CLOUDINARY_API_KEY: z.string().min(1).describe("Cloudinary API key"),
  CLOUDINARY_API_SECRET: z.string().min(1).describe("Cloudinary API secret"),
  SMTP_HOST: z.string().min(1).describe("SMTP host for nodemailer"),
  SMTP_PORT: z.coerce.number().default(587).describe("SMTP port for nodemailer"),
  SMTP_USER: z.string().min(1).describe("SMTP username"),
  SMTP_PASS: z.string().min(1).describe("SMTP password"),
  SMTP_FROM: z.string().email().describe("Sender email for transactional mails"),
  FRONTEND_URL: z.string().url().optional().describe("Frontend application URL"),
});

// ✅ VALIDATION
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ INVALID ENVIRONMENT VARIABLES");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
