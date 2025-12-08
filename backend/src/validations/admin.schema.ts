import { z } from "zod";
import { Role, UserStatus } from "@/constants/user.constants.js";

// ---- Admin Update User Schema ----
export const adminUpdateUserSchema = z.object({
    params: z.object({
        userId: z.string().min(1, "User ID is required"),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name must not exceed 100 characters")
            .trim()
            .optional(),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            )
            .toLowerCase()
            .trim()
            .optional(),
        bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
        role: z.enum([Role.USER, Role.ADMIN]).optional(),
        status: z.enum([UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.BLOCKED]).optional(),
    }),
});

// ---- Admin Update Post Schema ----
export const adminUpdatePostSchema = z.object({
    params: z.object({
        postId: z.string().min(1, "Post ID is required"),
    }),
    body: z.object({
        title: z
            .string()
            .min(5, "Title must be at least 5 characters")
            .max(200, "Title must not exceed 200 characters")
            .trim()
            .optional(),
        description: z
            .string()
            .min(10, "Description must be at least 10 characters")
            .max(500, "Description must not exceed 500 characters")
            .optional(),
        content: z.string().min(50, "Content must be at least 50 characters").optional(),
        isPublished: z.boolean().optional(),
    }),
});

// ---- Admin Update Comment Schema ----
export const adminUpdateCommentSchema = z.object({
    params: z.object({
        commentId: z.string().min(1, "Comment ID is required"),
    }),
    body: z.object({
        content: z
            .string()
            .min(1, "Content is required")
            .max(2000, "Content must not exceed 2000 characters"),
    }),
});

// ---- Admin Restore Comment Schema ----
export const adminRestoreCommentSchema = z.object({
    params: z.object({
        commentId: z.string().min(1, "Comment ID is required"),
    }),
    body: z.object({
        content: z
            .string()
            .min(1, "Original content is required to restore")
            .max(2000, "Content must not exceed 2000 characters"),
    }),
});

// ---- Pagination Query Schema ----
export const paginationQuerySchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});

// ---- Type Exports ----
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>["body"];
export type AdminUpdatePostInput = z.infer<typeof adminUpdatePostSchema>["body"];
export type AdminUpdateCommentInput = z.infer<typeof adminUpdateCommentSchema>["body"];
