import { Router } from "express";
import { authGuard } from "@/middlewares/authGuard.js";
import { adminGuard } from "@/middlewares/adminGuard.js";
import { validate } from "@/middlewares/system/validate.js";
import * as AdminController from "@/controllers/admin.controller.js";
import {
    adminUpdateUserSchema,
    adminUpdatePostSchema,
    adminUpdateCommentSchema,
    adminRestoreCommentSchema,
} from "@/validations/admin.schema.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authGuard, adminGuard);

// ===================== DASHBOARD =====================
router.get("/dashboard", AdminController.getDashboardStats);
router.get("/analytics", AdminController.getAnalytics);

// ===================== USER MANAGEMENT =====================
router.get("/users", AdminController.getAllUsers);
router.get("/users/:userId", AdminController.getUserById);
router.patch("/users/:userId", validate(adminUpdateUserSchema), AdminController.updateUser);
router.delete("/users/:userId", AdminController.deleteUser);
router.post("/users/:userId/block", AdminController.blockUser);
router.post("/users/:userId/unblock", AdminController.unblockUser);

// ===================== POST MANAGEMENT =====================
router.get("/posts", AdminController.getAllPosts);
router.get("/posts/:postId", AdminController.getPostById);
router.patch("/posts/:postId", validate(adminUpdatePostSchema), AdminController.updatePost);
router.delete("/posts/:postId", AdminController.deletePost);

// ===================== COMMENT MANAGEMENT =====================
router.get("/comments", AdminController.getAllComments);
router.get("/comments/:commentId", AdminController.getCommentById);
router.patch("/comments/:commentId", validate(adminUpdateCommentSchema), AdminController.updateComment);
router.delete("/comments/:commentId", AdminController.deleteComment); // Use ?hard=true for permanent delete
router.post("/comments/:commentId/restore", validate(adminRestoreCommentSchema), AdminController.restoreComment);

export default router;
