import { Router } from "express";
import { createPostSchema, updatePostSchema, getPostsSchema, postIdSchema } from "@/validations/post.schema.js";
import { validate } from "@/middlewares/system/validate.js";
import * as PostController from "@/controllers/post.controller.js";
import { authGuard } from "@/middlewares/authGuard.js";
import { uploadSingleImage } from "@/middlewares/upload.js";

const router = Router();

// ---- Protected Routes (specific paths first) ----
router.get("/me/posts", authGuard, PostController.getMyPosts);

// ---- Public Routes ----
router.get("/", validate(getPostsSchema), PostController.getPosts);
router.get("/user/:userId", PostController.getUserPosts);
router.get("/:id", validate(postIdSchema), PostController.getPost);

// ---- Protected Routes ----
router.post(
    "/",
    authGuard,
    uploadSingleImage("image"),
    validate(createPostSchema),
    PostController.createPost
);

router.put(
    "/:id",
    authGuard,
    uploadSingleImage("image"),
    validate(updatePostSchema),
    PostController.updatePost
);

router.delete("/:id", authGuard, validate(postIdSchema), PostController.deletePost);

router.post("/:id/like", authGuard, validate(postIdSchema), PostController.toggleLike);

router.patch("/:id/publish", authGuard, validate(postIdSchema), PostController.togglePublish);

export default router;
