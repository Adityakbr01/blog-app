import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";
import { env } from "@/config/env.js"; // <- validated env

// Logs folder at project root
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Dev format
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ timestamp, level, message, stack }) => `${timestamp} ${level}: ${stack || message}`,
  ),
);

// Prod format
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Daily file transports
const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%-app.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: env.LOG_LEVEL, // ✅ LINKED WITH ENV
});

const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%-errors.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "error",
});

// Console transport for DEV
const consoleTransport = new winston.transports.Console({
  format: devFormat,
});

// Logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: env.LOG_LEVEL, // ✅ LINKED WITH ENV
  format: env.NODE_ENV === "production" ? prodFormat : devFormat,
  transports: [
    fileTransport,
    errorTransport,
    ...(env.NODE_ENV !== "production" ? [consoleTransport] : []),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "%DATE%-exceptions.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "%DATE%-rejections.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
  exitOnError: false,
});

export default logger;
