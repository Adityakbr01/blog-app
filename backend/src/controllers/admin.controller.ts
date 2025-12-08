import { Request, Response } from "express";
import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as AdminService from "@/services/admin.service.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { asyncWrap } from "@/utils/asyncWrap.js";

// ===================== USER MANAGEMENT =====================

export const getAllUsers = asyncWrap(async (req: Request, res: Response) => {
    const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as AdminService.AdminUserQuery["status"],
        role: req.query.role as AdminService.AdminUserQuery["role"],
        search: req.query.search as string,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await AdminService.getAllUsers(query);

    return sendResponse(res, HTTP_STATUS.OK, "Users retrieved successfully", result.users, {
        pagination: result.pagination,
    });
});

export const getUserById = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await AdminService.getUserById(userId);

    return sendResponse(res, HTTP_STATUS.OK, "User retrieved successfully", user);
});

export const updateUser = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updatedUser = await AdminService.updateUser(userId, req.body);

    return sendResponse(res, HTTP_STATUS.OK, "User updated successfully", updatedUser);
});

export const deleteUser = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await AdminService.deleteUser(userId);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

export const blockUser = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await AdminService.blockUser(userId);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

export const unblockUser = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await AdminService.unblockUser(userId);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ===================== POST MANAGEMENT =====================

export const getAllPosts = asyncWrap(async (req: Request, res: Response) => {
    const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        isPublished: req.query.isPublished === "true" ? true : req.query.isPublished === "false" ? false : undefined,
        authorId: req.query.authorId as string,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await AdminService.getAllPosts(query);

    return sendResponse(res, HTTP_STATUS.OK, "Posts retrieved successfully", result.posts, {
        pagination: result.pagination,
    });
});

export const getPostById = asyncWrap(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const post = await AdminService.getPostById(postId);

    return sendResponse(res, HTTP_STATUS.OK, "Post retrieved successfully", post);
});

export const updatePost = asyncWrap(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const updatedPost = await AdminService.updatePost(postId, req.body);

    return sendResponse(res, HTTP_STATUS.OK, "Post updated successfully", updatedPost);
});

export const deletePost = asyncWrap(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const result = await AdminService.deletePost(postId);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ===================== COMMENT MANAGEMENT =====================

export const getAllComments = asyncWrap(async (req: Request, res: Response) => {
    const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        postId: req.query.postId as string,
        authorId: req.query.authorId as string,
        isDeleted: req.query.isDeleted === "true" ? true : req.query.isDeleted === "false" ? false : undefined,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await AdminService.getAllComments(query);

    return sendResponse(res, HTTP_STATUS.OK, "Comments retrieved successfully", result.comments, {
        pagination: result.pagination,
    });
});

export const getCommentById = asyncWrap(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const comment = await AdminService.getCommentById(commentId);

    return sendResponse(res, HTTP_STATUS.OK, "Comment retrieved successfully", comment);
});

export const updateComment = asyncWrap(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const updatedComment = await AdminService.updateComment(commentId, content);

    return sendResponse(res, HTTP_STATUS.OK, "Comment updated successfully", updatedComment);
});

export const deleteComment = asyncWrap(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const hardDelete = req.query.hard === "true";
    const result = await AdminService.deleteComment(commentId, hardDelete);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

export const restoreComment = asyncWrap(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await AdminService.restoreComment(commentId, content);

    return sendResponse(res, HTTP_STATUS.OK, "Comment restored successfully", comment);
});

// ===================== DASHBOARD =====================

export const getDashboardStats = asyncWrap(async (_req: Request, res: Response) => {
    const stats = await AdminService.getDashboardStats();

    return sendResponse(res, HTTP_STATUS.OK, "Dashboard stats retrieved successfully", stats);
});

export const getAnalytics = asyncWrap(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await AdminService.getAnalytics(days);

    return sendResponse(res, HTTP_STATUS.OK, "Analytics retrieved successfully", analytics);
});
