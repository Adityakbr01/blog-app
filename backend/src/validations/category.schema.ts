import { z } from "zod";

// ---- Create Category Schema ----
export const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string({ error: "Name is required" })
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must not exceed 50 characters")
            .trim(),
        description: z
            .string()
            .max(200, "Description must not exceed 200 characters")
            .optional(),
        color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #6366f1)")
            .optional(),
        icon: z.string().max(100).optional(),
    }),
});

// ---- Update Category Schema ----
export const updateCategorySchema = z.object({
    params: z.object({
        id: z.string({ error: "Category ID is required" }),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must not exceed 50 characters")
            .trim()
            .optional(),
        description: z
            .string()
            .max(200, "Description must not exceed 200 characters")
            .optional(),
        color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
            .optional(),
        icon: z.string().max(100).optional(),
        isActive: z.boolean().optional(),
    }),
});

// ---- Type Exports ----
export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
