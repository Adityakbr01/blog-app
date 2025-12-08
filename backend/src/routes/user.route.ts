import { Router } from "express";
import { updateProfileSchema, changePasswordSchema } from "@/validations/user.schema.js";
import { validate } from "@/middlewares/system/validate.js";
import * as UserController from "@/controllers/user.controller.js";
import { authGuard } from "@/middlewares/authGuard.js";
import { upload } from "@/middlewares/upload.js";

const router = Router();

// ---- Public Routes ----
router.get("/profile/:identifier", UserController.getPublicProfile);
router.get("/check-username/:username", UserController.checkUsername);

// ---- Protected Routes ---- All Tested and Working
router.get("/me", authGuard, UserController.getProfile);
router.patch(
    "/me",
    authGuard,
    upload.single("avatar"),
    validate(updateProfileSchema),
    UserController.updateProfile
);
router.patch(
    "/me/password",
    authGuard,
    validate(changePasswordSchema),
    UserController.changePassword
);
router.delete("/me/avatar", authGuard, UserController.deleteAvatar);

export default router;
