import { HTTP_STATUS } from "@/constants/api.constants.js";
import CommentModel from "@/model/comment.model.js";
import PostModel from "@/model/post.model.js";
import AppError from "@/utils/AppError.js";
import { CreateCommentInput, UpdateCommentInput, GetCommentsQuery } from "@/validations/comment.schema.js";
import { Types } from "mongoose";
import {
    getOrSet,
    invalidateCommentCache,
    invalidatePostCache,
    redisKeys,
    CACHE_TTL,
} from "@/helpers/index.js";

const MAX_COMMENT_DEPTH = 5;

// ---- Create Comment ----
export const createComment = async (
    postId: string,
    authorId: string,
    data: CreateCommentInput
) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!post.isPublished) {
        throw new AppError("Cannot comment on unpublished posts", HTTP_STATUS.FORBIDDEN);
    }

    let depth = 0;
    let parentComment = null;

    // Handle nested comments
    if (data.parentId) {
        parentComment = await CommentModel.findById(data.parentId);

        if (!parentComment) {
            throw new AppError("Parent comment not found", HTTP_STATUS.NOT_FOUND);
        }

        if (parentComment.post.toString() !== postId) {
            throw new AppError("Parent comment does not belong to this post", HTTP_STATUS.BAD_REQUEST);
        }

        if (parentComment.depth >= MAX_COMMENT_DEPTH) {
            throw new AppError(`Maximum comment depth of ${MAX_COMMENT_DEPTH} reached`, HTTP_STATUS.BAD_REQUEST);
        }

        depth = parentComment.depth + 1;
    }

    const comment = new CommentModel({
        post: new Types.ObjectId(postId),
        author: new Types.ObjectId(authorId),
        content: data.content,
        parent: data.parentId ? new Types.ObjectId(data.parentId) : null,
        depth,
        replies: [],
        isDeleted: false,
    });

    await comment.save();

    // Add reply reference to parent
    if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
    }

    // Update post comment count
    post.commentsCount += 1;
    await post.save();

    // Invalidate caches
    await invalidateCommentCache(postId, data.parentId);
    await invalidatePostCache(postId, post.author.toString());

    return comment.populate("author", "name email");
};

// ---- Get Comments for Post (with nested structure) ----
export const getComments = async (postId: string, query: GetCommentsQuery) => {
    const { page, limit } = query;

    const cacheKey = redisKeys.postComments(postId, page, limit);

    return getOrSet(
        cacheKey,
        async () => {
            const post = await PostModel.findById(postId);

            if (!post) {
                throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
            }

            const skip = (page - 1) * limit;

            // Get top-level comments only
            const [comments, total] = await Promise.all([
                CommentModel.find({ post: new Types.ObjectId(postId), parent: null })
                    .populate("author", "name email")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                CommentModel.countDocuments({ post: new Types.ObjectId(postId), parent: null }),
            ]);

            // Recursively populate replies
            const populateReplies = async (comment: Record<string, unknown>): Promise<Record<string, unknown>> => {
                const replies = comment.replies as Types.ObjectId[] | undefined;
                if (!replies || replies.length === 0) {
                    return { ...comment, replies: [] };
                }

                const replyDocs = await CommentModel.find({ _id: { $in: replies } })
                    .populate("author", "name email")
                    .lean();

                const populatedReplies = await Promise.all(
                    replyDocs.map((r) => populateReplies(r as unknown as Record<string, unknown>))
                );

                return { ...comment, replies: populatedReplies };
            };

            const populatedComments = await Promise.all(
                comments.map((c) => populateReplies(c as unknown as Record<string, unknown>))
            );

            return {
                comments: populatedComments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            };
        },
        CACHE_TTL.COMMENT
    );
};

// ---- Get Single Comment ----
export const getComment = async (commentId: string) => {
    const cacheKey = redisKeys.comment(commentId);

    return getOrSet(
        cacheKey,
        async () => {
            const comment = await CommentModel.findById(commentId)
                .populate("author", "name email")
                .populate({
                    path: "replies",
                    populate: { path: "author", select: "name email" },
                });

            if (!comment) {
                throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
            }

            return comment.toObject();
        },
        CACHE_TTL.COMMENT
    );
};

// ---- Update Comment ----
export const updateComment = async (
    commentId: string,
    authorId: string,
    data: UpdateCommentInput
) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    if (comment.author.toString() !== authorId) {
        throw new AppError("You can only edit your own comments", HTTP_STATUS.FORBIDDEN);
    }

    if (comment.isDeleted) {
        throw new AppError("Cannot edit a deleted comment", HTTP_STATUS.BAD_REQUEST);
    }

    comment.content = data.content;
    await comment.save();

    // Invalidate caches
    await invalidateCommentCache(comment.post.toString(), commentId);

    return comment.populate("author", "name email");
};

// ---- Delete Comment ----
export const deleteComment = async (commentId: string, authorId: string, isAdmin: boolean = false) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    if (comment.author.toString() !== authorId && !isAdmin) {
        throw new AppError("You can only delete your own comments", HTTP_STATUS.FORBIDDEN);
    }

    const postId = comment.post.toString();

    // Check if comment has replies
    const hasReplies = comment.replies && comment.replies.length > 0;

    if (hasReplies) {
        // Soft delete - preserve structure for nested comments
        comment.isDeleted = true;
        comment.content = "[deleted]";
        await comment.save();
    } else {
        // Hard delete - no replies, safe to remove completely
        // Remove reference from parent if exists
        if (comment.parent) {
            await CommentModel.findByIdAndUpdate(comment.parent, {
                $pull: { replies: comment._id },
            });
        }
        await comment.deleteOne();
    }

    // Decrement post comment count
    await PostModel.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    // Invalidate caches
    await invalidateCommentCache(postId, commentId);

    return { message: "Comment deleted successfully" };
};

// ---- Get Replies for a Comment ----
export const getReplies = async (commentId: string) => {
    const cacheKey = redisKeys.commentReplies(commentId);

    return getOrSet(
        cacheKey,
        async () => {
            const comment = await CommentModel.findById(commentId);

            if (!comment) {
                throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
            }

            const replies = await CommentModel.find({ parent: new Types.ObjectId(commentId) })
                .populate("author", "name email")
                .sort({ createdAt: 1 })
                .lean();

            return replies;
        },
        CACHE_TTL.COMMENT
    );
};
