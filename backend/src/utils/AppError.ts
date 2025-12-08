import { HTTP_STATUS } from "@/constants/api.constants.js";

export default class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}
