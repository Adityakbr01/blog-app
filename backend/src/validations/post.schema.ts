import { z } from "zod";

// Helper to parse tags from form-data (can be JSON string, comma-separated, or array)
const tagsPreprocess = (val: unknown) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
        // Try parsing as JSON array first
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // If not JSON, split by comma
            if (val.trim() === "") return [];
            return val.split(",").map((t) => t.trim()).filter(Boolean);
        }
    }
    return [];
};

// Helper to parse boolean from form-data string
const booleanPreprocess = (val: unknown) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") {
        if (val.toLowerCase() === "true" || val === "1") return true;
        if (val.toLowerCase() === "false" || val === "0") return false;
    }
    return undefined;
};

// ---- Create Post Schema ----
export const createPostSchema = z.object({
    body: z.object({
        title: z
            .string({ error: "Title is required" })
            .min(3, "Title must be at least 3 characters")
            .max(200, "Title must not exceed 200 characters")
            .trim(),
        description: z
            .string({ error: "Description is required" })
            .min(10, "Description must be at least 10 characters")
            .max(500, "Description must not exceed 500 characters")
            .trim(),
        content: z
            .string({ error: "Content is required" })
            .min(50, "Content must be at least 50 characters"),
        category: z.string().optional(),
        tags: z.preprocess(
            tagsPreprocess,
            z.array(z.string().max(30).trim()).max(10, "Maximum 10 tags allowed").default([])
        ),
        isPublished: z.preprocess(booleanPreprocess, z.boolean().optional().default(false)),
    }),
});

// ---- Update Post Schema ----
export const updatePostSchema = z.object({
    params: z.object({
        id: z.string({ error: "Post ID is required" }),
    }),
    body: z.object({
        title: z
            .string()
            .min(3, "Title must be at least 3 characters")
            .max(200, "Title must not exceed 200 characters")
            .trim()
            .optional(),
        description: z
            .string()
            .min(10, "Description must be at least 10 characters")
            .max(500, "Description must not exceed 500 characters")
            .trim()
            .optional(),
        content: z.string().min(50, "Content must be at least 50 characters").optional(),
        category: z.string().optional(),
        tags: z.preprocess(
            tagsPreprocess,
            z.array(z.string().max(30).trim()).max(10, "Maximum 10 tags allowed").optional()
        ),
        isPublished: z.preprocess(booleanPreprocess, z.boolean().optional()),
    }),
});

// ---- Get Posts Query Schema ----
export const getPostsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(10),
        search: z.string().optional(),
        author: z.string().optional(),
        category: z.string().optional(),
        tag: z.string().optional(),
        published: z.enum(["true", "false"]).optional(),
        sortBy: z.enum(["createdAt", "likesCount", "commentsCount", "title"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }),
});

// ---- Post ID Param Schema ----
export const postIdSchema = z.object({
    params: z.object({
        id: z.string({ error: "Post ID is required" }),
    }),
});

// ---- Type Exports ----
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type GetPostsQuery = z.infer<typeof getPostsSchema>["query"];
