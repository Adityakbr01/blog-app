import { Request, Response, NextFunction } from "express";
import AppError from "@/utils/AppError.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    HTTP_STATUS.NOT_FOUND,
  );

  next(error);
};
