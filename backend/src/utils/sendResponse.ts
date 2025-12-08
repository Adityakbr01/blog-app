import { Response } from "express";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: unknown;
  statusCode: number;
  environment?: string;
  timestamp: string;
}

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: unknown,
  environment?: string,
) {
  const payload: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta,
    statusCode,
    environment,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(payload);
}
