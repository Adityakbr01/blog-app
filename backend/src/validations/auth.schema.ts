import { z } from "zod";

// ---- Signup Schema ----
export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .trim(),
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters"),
  }),
});

// ---- Verify OTP Schema ----
export const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    otp: z
      .string({ error: "OTP is required" })
      .length(6, "OTP must be 6 digits")
      .regex(/^[0-9]{6}$/),
  }),
});

// ---- Resend OTP Schema ----
export const resendOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    type: z
      .enum(["signup", "forgot-password"] as const, {
        message: "Type must be 'signup' or 'forgot-password'",
      })
      .default("signup"),
  }),
});

// ---- Forgot Password Schema ----
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
  }),
});

// ---- Reset Password Schema ----
export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string({ error: "Email is required" })
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
      otp: z
        .string({ error: "OTP is required" })
        .length(6, "OTP must be 6 digits")
        .regex(/^[0-9]{6}$/),
      newPassword: z
        .string({ error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
      confirmPassword: z.string({ error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// ---- Login Schema ----
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    password: z.string({ error: "Password is required" }).min(1, "Password is required"),
  }),
});

// ---- Type Exports ----
export type SignupInput = z.infer<typeof signupSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
export type ResendOtpInput = z.infer<typeof resendOtpSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
