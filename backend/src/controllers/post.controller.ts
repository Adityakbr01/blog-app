import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as PostService from "@/services/post.service.js";
import { asyncWrap } from "@/utils/asyncWrap.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { CreatePostInput, UpdatePostInput, GetPostsQuery } from "@/validations/post.schema.js";
import { Request, Response } from "express";

// ---- Create Post Controller ----
export const createPost = asyncWrap(async (req: Request, res: Response) => {
    const authorId = req.user!.id;
    const data: CreatePostInput = req.body;
    const imageBuffer = req.file?.buffer;

    const post = await PostService.createPost(authorId, data, imageBuffer);

    return sendResponse(res, HTTP_STATUS.CREATED, "Post created successfully", post);
});

// ---- Get All Posts Controller ----
export const getPosts = asyncWrap(async (req: Request, res: Response) => {
    const query = req.query as unknown as GetPostsQuery;
    const requesterId = req.user?.id;

    const result = await PostService.getPosts(query, requesterId);

    return sendResponse(res, HTTP_STATUS.OK, "Posts retrieved successfully", result);
});

// ---- Get Single Post Controller ----
export const getPost = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await PostService.getPostByIdOrSlug(id);

    return sendResponse(res, HTTP_STATUS.OK, "Post retrieved successfully", post);
});

// ---- Update Post Controller ----
export const updatePost = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = req.user!.id;
    const data: UpdatePostInput = req.body;
    const imageBuffer = req.file?.buffer;

    const post = await PostService.updatePost(id, authorId, data, imageBuffer);

    return sendResponse(res, HTTP_STATUS.OK, "Post updated successfully", post);
});

// ---- Delete Post Controller ----
export const deletePost = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = req.user!.id;
    const isAdmin = req.user!.role === "ADMIN";

    const result = await PostService.deletePost(id, authorId, isAdmin);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ---- Toggle Like Controller ----
export const toggleLike = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await PostService.toggleLike(id, userId);

    return sendResponse(
        res,
        HTTP_STATUS.OK,
        result.liked ? "Post liked" : "Post unliked",
        result
    );
});

// ---- Toggle Publish Controller ----
export const togglePublish = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const authorId = req.user!.id;

    const result = await PostService.togglePublish(id, authorId);

    return sendResponse(res, HTTP_STATUS.OK, result.message, { isPublished: result.isPublished });
});

// ---- Get My Posts Controller ----
export const getMyPosts = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const posts = await PostService.getUserPosts(userId, true);

    return sendResponse(res, HTTP_STATUS.OK, "Your posts retrieved successfully", posts);
});

// ---- Get User's Posts Controller ----
export const getUserPosts = asyncWrap(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const posts = await PostService.getUserPosts(userId, false);

    return sendResponse(res, HTTP_STATUS.OK, "User posts retrieved successfully", posts);
});
