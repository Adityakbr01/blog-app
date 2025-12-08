import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import AppError from "@/utils/AppError.js";
import logger from "@/utils/logger.js";
import { formatZodError } from "@/utils/formatZodError.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";

interface HttpError extends Error {
  statusCode?: number;
  code?: string | number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

type FormattedError = { field: string; message: string }[];

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);

  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errors: FormattedError | string[] | null = null;

  /* ----------------------------- ZOD ERRORS ----------------------------- */
  if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation failed";
    errors = formatZodError(err);
  }

  /* --------------------------- MONGOOSE ERRORS --------------------------- */
  // Mongoose Duplicate Key Error
  if (err.code === 11000 && err.keyValue) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation failed";
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors![key].message,
    }));
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Invalid ID format";
  }

  /* ----------------------------- EMPTY BODY ------------------------------ */
  if (
    req.method !== "GET" &&
    ["POST", "PUT", "PATCH"].includes(req.method) &&
    req.body &&
    Object.keys(req.body).length === 0
  ) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Request body cannot be empty";
  }

  /* ----------------------------- APP ERRORS ------------------------------ */
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  /* -------------------------- FINAL RESPONSE ----------------------------- */
  res.status(statusCode).json({
    success: false,
    statusCode,
    timestamp: new Date().toISOString(),
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
