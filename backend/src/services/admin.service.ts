import { HTTP_STATUS } from "@/constants/api.constants.js";
import { Role, UserStatus } from "@/constants/user.constants.js";
import UserModel from "@/model/user.model.js";
import PostModel from "@/model/post.model.js";
import CommentModel from "@/model/comment.model.js";
import AppError from "@/utils/AppError.js";
import { deleteFromCloudinary } from "@/utils/cloudinaryUpload.js";
import { invalidateUserCache, invalidatePostCache, invalidateCommentCache, deleteCachePattern } from "@/helpers/cache.helper.js";

// ===================== USER MANAGEMENT =====================

export interface AdminUserQuery {
    page?: number;
    limit?: number;
    status?: UserStatus;
    role?: Role;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const getAllUsers = async (query: AdminUserQuery) => {
    const {
        page = 1,
        limit = 20,
        status,
        role,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (role) filter.role = role;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [users, total] = await Promise.all([
        UserModel.find(filter)
            .select("-password -refreshTokens -otp")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        UserModel.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getUserById = async (userId: string) => {
    const user = await UserModel.findById(userId)
        .select("-password -refreshTokens -otp")
        .lean();

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Get user stats
    const [postCount, commentCount] = await Promise.all([
        PostModel.countDocuments({ author: userId }),
        CommentModel.countDocuments({ author: userId, isDeleted: false }),
    ]);

    return {
        ...user,
        stats: {
            posts: postCount,
            comments: commentCount,
        },
    };
};

export interface UpdateUserInput {
    name?: string;
    username?: string;
    bio?: string;
    role?: Role;
    status?: UserStatus;
}

export const updateUser = async (userId: string, data: UpdateUserInput) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check username uniqueness if changing
    if (data.username && data.username !== user.username) {
        const existingUser = await UserModel.findOne({ username: data.username });
        if (existingUser) {
            throw new AppError("Username is already taken", HTTP_STATUS.CONFLICT);
        }
    }

    // Update fields
    if (data.name !== undefined) user.name = data.name;
    if (data.username !== undefined) user.username = data.username;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.role !== undefined) user.role = data.role;
    if (data.status !== undefined) user.status = data.status;

    await user.save();
    await invalidateUserCache(userId);

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, refreshTokens: _tokens, otp: _otp, ...safeUser } = userObj;

    return safeUser;
};

export const deleteUser = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Delete user's avatar from cloudinary
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }

    // Delete all user's posts and their images
    const posts = await PostModel.find({ author: userId });
    for (const post of posts) {
        if (post.imagePublicId) {
            await deleteFromCloudinary(post.imagePublicId);
        }
    }
    await PostModel.deleteMany({ author: userId });

    // Delete all user's comments
    await CommentModel.deleteMany({ author: userId });

    // Delete the user
    await UserModel.findByIdAndDelete(userId);

    // Invalidate caches
    await invalidateUserCache(userId);
    await deleteCachePattern("posts:*");
    await deleteCachePattern("comments:*");

    return { message: "User and all associated data deleted successfully" };
};

export const blockUser = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    if (user.role === Role.ADMIN) {
        throw new AppError("Cannot block an admin user", HTTP_STATUS.FORBIDDEN);
    }

    user.status = UserStatus.BLOCKED;
    user.refreshTokens = []; // Logout from all devices
    await user.save();
    await invalidateUserCache(userId);

    return { message: "User blocked successfully" };
};

export const unblockUser = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    if (user.status !== UserStatus.BLOCKED) {
        throw new AppError("User is not blocked", HTTP_STATUS.BAD_REQUEST);
    }

    user.status = UserStatus.ACTIVE;
    await user.save();
    await invalidateUserCache(userId);

    return { message: "User unblocked successfully" };
};

// ===================== POST MANAGEMENT =====================

export interface AdminPostQuery {
    page?: number;
    limit?: number;
    isPublished?: boolean;
    authorId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const getAllPosts = async (query: AdminPostQuery) => {
    const {
        page = 1,
        limit = 20,
        isPublished,
        authorId,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = {};

    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (authorId) filter.author = authorId;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [posts, total] = await Promise.all([
        PostModel.find(filter)
            .populate("author", "name username avatar")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        PostModel.countDocuments(filter),
    ]);

    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPostById = async (postId: string) => {
    const post = await PostModel.findById(postId)
        .populate("author", "name username avatar email")
        .lean();

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    return post;
};

export interface AdminUpdatePostInput {
    title?: string;
    description?: string;
    content?: string;
    isPublished?: boolean;
}

export const updatePost = async (postId: string, data: AdminUpdatePostInput) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (data.title !== undefined) post.title = data.title;
    if (data.description !== undefined) post.description = data.description;
    if (data.content !== undefined) post.content = data.content;
    if (data.isPublished !== undefined) post.isPublished = data.isPublished;

    await post.save();
    await invalidatePostCache(postId, post.author.toString());

    return post;
};

export const deletePost = async (postId: string) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    // Delete post image from cloudinary
    if (post.imagePublicId) {
        await deleteFromCloudinary(post.imagePublicId);
    }

    // Delete all comments on this post
    await CommentModel.deleteMany({ post: postId });

    // Delete the post
    await PostModel.findByIdAndDelete(postId);

    // Invalidate caches
    await invalidatePostCache(postId, post.author.toString());
    await invalidateCommentCache(postId);

    return { message: "Post and all associated comments deleted successfully" };
};

// ===================== COMMENT MANAGEMENT =====================

export interface AdminCommentQuery {
    page?: number;
    limit?: number;
    postId?: string;
    authorId?: string;
    isDeleted?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export const getAllComments = async (query: AdminCommentQuery) => {
    const {
        page = 1,
        limit = 20,
        postId,
        authorId,
        isDeleted,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const filter: Record<string, unknown> = {};

    if (postId) filter.post = postId;
    if (authorId) filter.author = authorId;
    if (isDeleted !== undefined) filter.isDeleted = isDeleted;

    const skip = (page - 1) * limit;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [comments, total] = await Promise.all([
        CommentModel.find(filter)
            .populate("author", "name username avatar")
            .populate("post", "title slug")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(),
        CommentModel.countDocuments(filter),
    ]);

    return {
        comments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getCommentById = async (commentId: string) => {
    const comment = await CommentModel.findById(commentId)
        .populate("author", "name username avatar email")
        .populate("post", "title slug")
        .lean();

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    return comment;
};

export const updateComment = async (commentId: string, content: string) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    comment.content = content;
    await comment.save();
    await invalidateCommentCache(comment.post.toString(), commentId);

    return comment;
};

export const deleteComment = async (commentId: string, hardDelete: boolean = false) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    const postId = comment.post.toString();

    if (hardDelete) {
        // Recursively delete all replies
        const deleteReplies = async (parentId: string) => {
            const replies = await CommentModel.find({ parent: parentId });
            for (const reply of replies) {
                await deleteReplies(reply._id.toString());
                await CommentModel.findByIdAndDelete(reply._id);
            }
        };

        await deleteReplies(commentId);
        await CommentModel.findByIdAndDelete(commentId);

        // Update parent's replies array if exists
        if (comment.parent) {
            await CommentModel.findByIdAndUpdate(comment.parent, {
                $pull: { replies: commentId },
            });
        }

        // Update post comment count
        const remainingComments = await CommentModel.countDocuments({
            post: postId,
            isDeleted: false,
        });
        await PostModel.findByIdAndUpdate(postId, { commentsCount: remainingComments });
    } else {
        // Soft delete
        comment.isDeleted = true;
        comment.content = "[This comment has been removed by admin]";
        await comment.save();
    }

    await invalidateCommentCache(postId, commentId);

    return { message: hardDelete ? "Comment permanently deleted" : "Comment soft deleted" };
};

export const restoreComment = async (commentId: string, originalContent: string) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
        throw new AppError("Comment not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!comment.isDeleted) {
        throw new AppError("Comment is not deleted", HTTP_STATUS.BAD_REQUEST);
    }

    comment.isDeleted = false;
    comment.content = originalContent;
    await comment.save();
    await invalidateCommentCache(comment.post.toString(), commentId);

    return comment;
};

// ===================== DASHBOARD STATS =====================

export const getDashboardStats = async () => {
    const [
        totalUsers,
        activeUsers,
        pendingUsers,
        blockedUsers,
        totalPosts,
        publishedPosts,
        draftPosts,
        totalComments,
        deletedComments,
    ] = await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ status: UserStatus.ACTIVE }),
        UserModel.countDocuments({ status: UserStatus.PENDING }),
        UserModel.countDocuments({ status: UserStatus.BLOCKED }),
        PostModel.countDocuments(),
        PostModel.countDocuments({ isPublished: true }),
        PostModel.countDocuments({ isPublished: false }),
        CommentModel.countDocuments(),
        CommentModel.countDocuments({ isDeleted: true }),
    ]);

    // Get recent activity
    const [recentUsers, recentPosts, recentComments] = await Promise.all([
        UserModel.find()
            .select("name email avatar createdAt status")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        PostModel.find()
            .select("title author createdAt isPublished")
            .populate("author", "name username")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        CommentModel.find({ isDeleted: false })
            .select("content author post createdAt")
            .populate("author", "name username")
            .populate("post", "title slug")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
    ]);

    // Get aggregated stats for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsersLast7Days, newPostsLast7Days, newCommentsLast7Days] = await Promise.all([
        UserModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        PostModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        CommentModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            pending: pendingUsers,
            blocked: blockedUsers,
            newLast7Days: newUsersLast7Days,
        },
        posts: {
            total: totalPosts,
            published: publishedPosts,
            drafts: draftPosts,
            newLast7Days: newPostsLast7Days,
        },
        comments: {
            total: totalComments,
            active: totalComments - deletedComments,
            deleted: deletedComments,
            newLast7Days: newCommentsLast7Days,
        },
        recentActivity: {
            users: recentUsers,
            posts: recentPosts,
            comments: recentComments,
        },
    };
};

export const getAnalytics = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate daily stats
    const [userStats, postStats, commentStats] = await Promise.all([
        UserModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        PostModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    published: { $sum: { $cond: ["$isPublished", 1, 0] } },
                },
            },
            { $sort: { _id: 1 } },
        ]),
        CommentModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    // Top authors by post count
    const topAuthors = await PostModel.aggregate([
        { $group: { _id: "$author", postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "author",
            },
        },
        { $unwind: "$author" },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                name: "$author.name",
                username: "$author.username",
                avatar: "$author.avatar",
                postCount: 1,
            },
        },
    ]);

    // Most liked posts
    const topPosts = await PostModel.find({ isPublished: true })
        .select("title slug likesCount commentsCount author")
        .populate("author", "name username")
        .sort({ likesCount: -1 })
        .limit(10)
        .lean();

    return {
        period: { days, startDate, endDate: new Date() },
        daily: {
            users: userStats,
            posts: postStats,
            comments: commentStats,
        },
        topAuthors,
        topPosts,
    };
};
