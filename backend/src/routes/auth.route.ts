import { Router } from "express";
import { signupSchema, loginSchema } from "@/validations/auth.schema.js";
import { validate } from "@/middlewares/system/validate.js";
import * as AuthController from "@/controllers/auth.controller.js";
import { authGuard } from "@/middlewares/authGuard.js";

const router = Router();

// ---- Public Routes ----
router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// ---- Protected Routes ----
router.post("/logout", authGuard, AuthController.logout);
router.get("/profile", authGuard, AuthController.getProfile);

export default router;
