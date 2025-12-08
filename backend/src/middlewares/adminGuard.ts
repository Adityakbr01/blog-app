import { Request, Response, NextFunction } from "express";
import { Role } from "@/constants/user.constants.js";
import AppError from "@/utils/AppError.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";

/**
 * Middleware to check if user is an admin
 * Must be used after authGuard middleware
 */
export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    if (req.user.role !== Role.ADMIN) {
        throw new AppError("Access denied. Admin privileges required.", HTTP_STATUS.FORBIDDEN);
    }

    next();
};

/**
 * Check if user is admin or owner of the resource
 */
export const adminOrOwner = (ownerIdField: string = "userId") => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
        }

        const ownerId = req.params[ownerIdField] || req.body[ownerIdField];

        // Admin can access anything
        if (req.user.role === Role.ADMIN) {
            return next();
        }

        // Check if user is the owner
        if (ownerId && req.user.id === ownerId) {
            return next();
        }

        throw new AppError("Access denied", HTTP_STATUS.FORBIDDEN);
    };
};
