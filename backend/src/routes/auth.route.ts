import { Router } from "express";
import { signupSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/validations/auth.schema.js";
import { validate } from "@/middlewares/system/validate.js";
import * as AuthController from "@/controllers/auth.controller.js";
import { authGuard } from "@/middlewares/authGuard.js";

const router = Router();

// ---- Public Routes ---- All Tested and Working
router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), AuthController.resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// ---- Protected Routes ----
router.post("/logout", authGuard, AuthController.logout);
router.get("/profile", authGuard, AuthController.getProfile);

export default router;
