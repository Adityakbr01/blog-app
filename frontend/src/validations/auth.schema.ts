import { z } from "zod";

// ---- Signup Schema ----
export const signupSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters"),
    email: z
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
});

// ---- Login Schema ----
export const loginSchema = z.object({
    email: z
        .email("Invalid email format"),
    password: z
        .string({ error: "Password is required" })
        .min(1, "Password is required"),
});

// ---- Type Exports ----
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
