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
export type LoginInput = z.infer<typeof loginSchema>["body"];
