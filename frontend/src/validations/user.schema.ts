import { z } from "zod";

// ---- Change Password Schema ----
export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: "Current password is required" })
            .min(1, "Current password is required"),
        newPassword: z
            .string({ error: "New password is required" })
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must not exceed 128 characters"),
        confirmPassword: z
            .string({ error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

// ---- Update Profile Schema ----
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .optional(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must not exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .optional(),
    bio: z
        .string()
        .max(500, "Bio must not exceed 500 characters")
        .optional(),
});

// ---- Type Exports ----
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
