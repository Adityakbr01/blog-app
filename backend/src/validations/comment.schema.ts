import { z } from "zod";

// ---- Create Comment Schema ----
export const createCommentSchema = z.object({
    params: z.object({
        postId: z.string({ error: "Post ID is required" }),
    }),
    body: z.object({
        content: z
            .string({ error: "Content is required" })
            .min(1, "Comment cannot be empty")
            .max(2000, "Comment must not exceed 2000 characters")
            .trim(),
        parentId: z.string().optional(),
    }),
});

// ---- Update Comment Schema ----
export const updateCommentSchema = z.object({
    params: z.object({
        id: z.string({ error: "Comment ID is required" }),
    }),
    body: z.object({
        content: z
            .string({ error: "Content is required" })
            .min(1, "Comment cannot be empty")
            .max(2000, "Comment must not exceed 2000 characters")
            .trim(),
    }),
});

// ---- Get Comments Schema ----
export const getCommentsSchema = z.object({
    params: z.object({
        postId: z.string({ error: "Post ID is required" }),
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(20),
    }),
});

// ---- Comment ID Param Schema ----
export const commentIdSchema = z.object({
    params: z.object({
        id: z.string({ error: "Comment ID is required" }),
    }),
});

// ---- Type Exports ----
export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>["body"];
export type GetCommentsQuery = z.infer<typeof getCommentsSchema>["query"];
