import { z } from "zod";

// ---- Update Profile Schema ----
export const updateProfileSchema = z.object({
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
        bio: z
            .string()
            .max(500, "Bio must not exceed 500 characters")
            .optional(),
    }),
});

// ---- Change Password Schema ----
export const changePasswordSchema = z.object({
    body: z
        .object({
            currentPassword: z
                .string({ error: "Current password is required" })
                .min(1, "Current password is required"),
            newPassword: z
                .string({ error: "New password is required" })
                .min(8, "New password must be at least 8 characters")
                .max(128, "New password must not exceed 128 characters"),
            confirmPassword: z
                .string({ error: "Confirm password is required" })
                .min(1, "Confirm password is required"),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        })
        .refine((data) => data.currentPassword !== data.newPassword, {
            message: "New password must be different from current password",
            path: ["newPassword"],
        }),
});

// ---- User ID Param Schema ----
export const userIdSchema = z.object({
    params: z.object({
        id: z.string({ error: "User ID is required" }),
    }),
});

// ---- Type Exports ----
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];
