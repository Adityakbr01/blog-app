import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as CommentService from "@/services/comment.service.js";
import { asyncWrap } from "@/utils/asyncWrap.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { CreateCommentInput, UpdateCommentInput, GetCommentsQuery } from "@/validations/comment.schema.js";
import { Request, Response } from "express";

// ---- Create Comment Controller ----
export const createComment = asyncWrap(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const authorId = req.user!.id;
    const data: CreateCommentInput = req.body;

    const comment = await CommentService.createComment(postId, authorId, data);

    return sendResponse(res, HTTP_STATUS.CREATED, "Comment created successfully", comment);
});

// ---- Get Comments Controller ----
export const getComments = asyncWrap(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const query = req.query as unknown as GetCommentsQuery;

    const result = await CommentService.getComments(postId, query);

    return sendResponse(res, HTTP_STATUS.OK, "Comments retrieved successfully", result);
});

// ---- Get Single Comment Controller ----
export const getComment = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;

    const comment = await CommentService.getComment(id);

    return sendResponse(res, HTTP_STATUS.OK, "Comment retrieved successfully", comment);
});

// ---- Update Comment Controller ----
export const updateComment = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = req.user!.id;
    const data: UpdateCommentInput = req.body;

    const comment = await CommentService.updateComment(id, authorId, data);

    return sendResponse(res, HTTP_STATUS.OK, "Comment updated successfully", comment);
});

// ---- Delete Comment Controller ----
export const deleteComment = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";

    const result = await CommentService.deleteComment(id, authorId, isAdmin);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ---- Get Replies Controller ----
export const getReplies = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;

    const replies = await CommentService.getReplies(id);

    return sendResponse(res, HTTP_STATUS.OK, "Replies retrieved successfully", replies);
});
