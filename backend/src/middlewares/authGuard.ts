import { Request, Response, NextFunction } from "express";
import AppError from "@/utils/AppError.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as AuthService from "@/services/auth.service.js";
import { verifyAccessToken } from "@/utils/auth.util.js";
import { Role } from "@/constants/user.constants.js";

// ---- Auth Guard Middleware ----
export const authGuard = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      throw new AppError("Access denied. No token provided.", HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);

    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.UNAUTHORIZED);
    }
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

// ---- Role Guard Middleware ----
export const roleGuard = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("Access denied. Authentication required.", HTTP_STATUS.UNAUTHORIZED),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied. Insufficient permissions.", HTTP_STATUS.FORBIDDEN));
    }

    next();
  };
};

// ---- Convenience Guards ----
export const adminOnly = roleGuard(Role.ADMIN);
export const userOnly = roleGuard(Role.USER);
export const authenticated = authGuard;
