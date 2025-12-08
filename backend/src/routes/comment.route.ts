import { Router } from "express";
import {
    createCommentSchema,
    updateCommentSchema,
    getCommentsSchema,
    commentIdSchema,
} from "@/validations/comment.schema.js";
import { validate } from "@/middlewares/system/validate.js";
import * as CommentController from "@/controllers/comment.controller.js";
import { authGuard } from "@/middlewares/authGuard.js";

const router = Router();

// ---- Public Routes ----
router.get("/post/:postId", validate(getCommentsSchema), CommentController.getComments);
router.get("/:id", validate(commentIdSchema), CommentController.getComment);
router.get("/:id/replies", validate(commentIdSchema), CommentController.getReplies);

// ---- Protected Routes ----
router.post(
    "/post/:postId",
    authGuard,
    validate(createCommentSchema),
    CommentController.createComment
);

router.put("/:id", authGuard, validate(updateCommentSchema), CommentController.updateComment);

router.delete("/:id", authGuard, validate(commentIdSchema), CommentController.deleteComment);

export default router;
