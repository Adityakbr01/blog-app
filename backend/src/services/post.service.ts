import { HTTP_STATUS } from "@/constants/api.constants.js";
import PostModel from "@/model/post.model.js";
import LikeModel from "@/model/like.model.js";
import CommentModel from "@/model/comment.model.js";
import CategoryModel from "@/model/category.model.js";
import AppError from "@/utils/AppError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinaryUpload.js";
import { CreatePostInput, UpdatePostInput, GetPostsQuery } from "@/validations/post.schema.js";
import slugifyLib from "slugify";
import { Types } from "mongoose";
import {
    getOrSet,
    invalidatePostCache,
    redisKeys,
    CACHE_TTL,
    hashQuery,
    deleteCachePattern,
} from "@/helpers/index.js";

const slugify = slugifyLib.default || slugifyLib;

// ---- Find Category by ID, Slug, or Name ----
const findCategory = async (categoryInput: string) => {
    // Try by ObjectId first
    if (Types.ObjectId.isValid(categoryInput)) {
        const category = await CategoryModel.findById(categoryInput);
        if (category) return category;
    }

    // Try by slug (lowercase)
    const bySlug = await CategoryModel.findOne({ slug: categoryInput.toLowerCase() });
    if (bySlug) return bySlug;

    // Try by name (case-insensitive)
    const byName = await CategoryModel.findOne({
        name: { $regex: new RegExp(`^${categoryInput}$`, "i") }
    });
    if (byName) return byName;

    return null;
};

// ---- Generate Unique Slug ----
const generateUniqueSlug = async (title: string): Promise<string> => {
    let slug = slugify(title, { lower: true, strict: true });
    let existingPost = await PostModel.findOne({ slug });
    let counter = 1;

    while (existingPost) {
        slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
        existingPost = await PostModel.findOne({ slug });
        counter++;
    }

    return slug;
};

// ---- Create Post ----
export const createPost = async (
    authorId: string,
    data: CreatePostInput,
    imageBuffer?: Buffer
) => {
    const slug = await generateUniqueSlug(data.title);

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (imageBuffer) {
        const uploadResult = await uploadToCloudinary(imageBuffer, "blog-posts");
        imageUrl = uploadResult.secureUrl;
        imagePublicId = uploadResult.publicId;
    }

    // Validate category if provided (supports ID, slug, or name)
    let categoryId: Types.ObjectId | undefined;
    if (data.category) {
        const category = await findCategory(data.category);
        if (!category) {
            throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
        }
        categoryId = category._id;
    }

    // Process tags - lowercase and trim
    const tags = data.tags?.map(tag => tag.toLowerCase().trim()).filter(Boolean) || [];

    const post = new PostModel({
        author: new Types.ObjectId(authorId),
        category: categoryId,
        title: data.title,
        slug,
        description: data.description,
        content: data.content,
        image: imageUrl,
        imagePublicId,
        tags,
        isPublished: data.isPublished || false,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
    });

    await post.save();

    // Update category post count if published
    if (data.isPublished && data.category) {
        await updateCategoryPostCount(data.category);
    }

    // Invalidate post list caches
    await invalidatePostCache(post._id.toString(), authorId);
    await deleteCachePattern("tags:*");

    return post.populate(["author", { path: "category", select: "name slug color" }]);
};

// Helper to update category post count
const updateCategoryPostCount = async (categoryId: string) => {
    const count = await PostModel.countDocuments({
        category: categoryId,
        isPublished: true,
    });
    await CategoryModel.findByIdAndUpdate(categoryId, { postCount: count });
};

// ---- Get All Posts (with filters & pagination) ----
export const getPosts = async (query: GetPostsQuery, requesterId?: string) => {
    const { page, limit, search, author, category, tag, published, sortBy, sortOrder } = query;

    // Generate cache key based on query
    const cacheKey = redisKeys.postList(hashQuery({ ...query, requesterId }));

    return getOrSet(
        cacheKey,
        async () => {
            const filter: Record<string, unknown> = {};

            // Only show published posts to non-authors
            if (published === "true") {
                filter.isPublished = true;
            } else if (published === "false" && requesterId) {
                // Allow author to see their unpublished posts
                filter.isPublished = false;
                filter.author = new Types.ObjectId(requesterId);
            } else if (!requesterId) {
                filter.isPublished = true;
            }

            if (author) {
                filter.author = new Types.ObjectId(author);
            }

            // Category filter - support both ID and slug
            if (category) {
                const isObjectId = Types.ObjectId.isValid(category);
                if (isObjectId) {
                    filter.category = new Types.ObjectId(category);
                } else {
                    // Find category by slug
                    const cat = await CategoryModel.findOne({ slug: category });
                    if (cat) {
                        filter.category = cat._id;
                    }
                }
            }

            // Tag filter
            if (tag) {
                filter.tags = tag.toLowerCase();
            }

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { tags: { $regex: search, $options: "i" } },
                ];
            }

            const skip = (page - 1) * limit;
            const sortOption: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

            const [posts, total] = await Promise.all([
                PostModel.find(filter)
                    .populate("author", "name username avatar")
                    .populate("category", "name slug color")
                    .sort(sortOption)
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
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            };
        },
        CACHE_TTL.POST_LIST
    );
};

// ---- Get Single Post by ID or Slug ----
export const getPostByIdOrSlug = async (identifier: string) => {
    const isObjectId = Types.ObjectId.isValid(identifier);
    const cacheKey = isObjectId ? redisKeys.post(identifier) : redisKeys.postBySlug(identifier);

    return getOrSet(
        cacheKey,
        async () => {
            const post = await PostModel.findOne(
                isObjectId ? { _id: identifier } : { slug: identifier }
            )
                .populate("author", "name username avatar")
                .populate("category", "name slug color");

            if (!post) {
                throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
            }

            return post.toObject();
        },
        CACHE_TTL.POST
    );
};

// ---- Update Post ----
export const updatePost = async (
    postId: string,
    authorId: string,
    data: UpdatePostInput,
    imageBuffer?: Buffer
) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (post.author.toString() !== authorId) {
        throw new AppError("You can only update your own posts", HTTP_STATUS.FORBIDDEN);
    }

    // Handle image update
    if (imageBuffer) {
        // Delete old image if exists
        if (post.imagePublicId) {
            await deleteFromCloudinary(post.imagePublicId);
        }

        const uploadResult = await uploadToCloudinary(imageBuffer, "blog-posts");
        post.image = uploadResult.secureUrl;
        post.imagePublicId = uploadResult.publicId;
    }

    // Update title and regenerate slug if needed
    if (data.title && data.title !== post.title) {
        post.title = data.title;
        post.slug = await generateUniqueSlug(data.title);
    }

    if (data.description !== undefined) post.description = data.description;
    if (data.content !== undefined) post.content = data.content;
    if (data.isPublished !== undefined) post.isPublished = data.isPublished;

    // Handle category update (supports ID, slug, or name)
    if (data.category !== undefined) {
        const oldCategory = post.category?.toString();
        if (data.category) {
            const category = await findCategory(data.category);
            if (!category) {
                throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
            }
            post.category = category._id;
            // Update post counts for both old and new categories
            if (oldCategory) await updateCategoryPostCount(oldCategory);
            await updateCategoryPostCount(category._id.toString());
        } else {
            post.category = undefined;
            if (oldCategory) await updateCategoryPostCount(oldCategory);
        }
    }

    // Handle tags update
    if (data.tags !== undefined) {
        post.tags = data.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);
        await deleteCachePattern("tags:*");
    }

    await post.save();

    // Invalidate caches
    await invalidatePostCache(postId, authorId);

    return post.populate(["author", { path: "category", select: "name slug color" }]);
};

// ---- Delete Post ----
export const deletePost = async (postId: string, authorId: string, isAdmin: boolean = false) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (post.author.toString() !== authorId && !isAdmin) {
        throw new AppError("You can only delete your own posts", HTTP_STATUS.FORBIDDEN);
    }

    // Delete image from Cloudinary
    if (post.imagePublicId) {
        await deleteFromCloudinary(post.imagePublicId);
    }

    // Delete all likes for this post
    await LikeModel.deleteMany({ post: postId });

    // Delete all comments for this post
    await CommentModel.deleteMany({ post: postId });

    await post.deleteOne();

    // Invalidate caches
    await invalidatePostCache(postId, authorId);

    return { message: "Post deleted successfully" };
};

// ---- Toggle Like ----
export const toggleLike = async (postId: string, userId: string) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    const existingLike = await LikeModel.findOne({
        post: new Types.ObjectId(postId),
        user: new Types.ObjectId(userId),
    });

    if (existingLike) {
        // Unlike
        await existingLike.deleteOne();
        post.likes = post.likes.filter((id) => id.toString() !== userId);
        post.likesCount = Math.max(0, post.likesCount - 1);
        await post.save();

        // Invalidate post cache
        await invalidatePostCache(postId, post.author.toString());

        return { liked: false, likesCount: post.likesCount };
    } else {
        // Like
        const like = new LikeModel({
            post: new Types.ObjectId(postId),
            user: new Types.ObjectId(userId),
        });
        await like.save();

        post.likes.push(new Types.ObjectId(userId));
        post.likesCount += 1;
        await post.save();

        // Invalidate post cache
        await invalidatePostCache(postId, post.author.toString());

        return { liked: true, likesCount: post.likesCount };
    }
};

// ---- Publish/Unpublish Post ----
export const togglePublish = async (postId: string, authorId: string) => {
    const post = await PostModel.findById(postId);

    if (!post) {
        throw new AppError("Post not found", HTTP_STATUS.NOT_FOUND);
    }

    if (post.author.toString() !== authorId) {
        throw new AppError("You can only publish/unpublish your own posts", HTTP_STATUS.FORBIDDEN);
    }

    post.isPublished = !post.isPublished;
    await post.save();

    // Invalidate caches
    await invalidatePostCache(postId, authorId);

    return {
        isPublished: post.isPublished,
        message: post.isPublished ? "Post published successfully" : "Post unpublished successfully",
    };
};

// ---- Get User's Posts ----
export const getUserPosts = async (userId: string, includeUnpublished: boolean = false) => {
    const cacheKey = redisKeys.userPosts(userId, includeUnpublished);

    return getOrSet(
        cacheKey,
        async () => {
            const filter: Record<string, unknown> = { author: new Types.ObjectId(userId) };

            if (!includeUnpublished) {
                filter.isPublished = true;
            }

            const posts = await PostModel.find(filter)
                .populate("author", "name email username avatar category")
                .sort({ createdAt: -1 })
                .lean();

            return posts;
        },
        CACHE_TTL.USER_POSTS
    );
};
