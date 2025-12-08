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

// ---- Verify OTP Schema ----
export const verifyOtpSchema = z.object({
    email: z
        .email("Invalid email format"),
    otp: z
        .string({ error: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]{6}$/, "OTP must contain only numbers"),
});

// ---- Resend OTP Schema ----
export const resendOtpSchema = z.object({
    email: z
        .email("Invalid email format"),
    type: z.enum(["signup", "forgot-password"]).default("signup"),
});

// ---- Forgot Password Schema ----
export const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email format"),
});

// ---- Reset Password Schema ----
export const resetPasswordSchema = z
    .object({
        email: z
            .email("Invalid email format"),
        otp: z
            .string({ error: "OTP is required" })
            .length(6, "OTP must be 6 digits")
            .regex(/^[0-9]{6}$/, "OTP must contain only numbers"),
        newPassword: z
            .string({ error: "New password is required" })
            .min(8, "Password must be at least 8 characters")
            .max(128, "Password must not exceed 128 characters"),
        confirmPassword: z.string({ error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// ---- Type Exports ----
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type ResendOtpFormData = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
