import { HTTP_STATUS } from "@/constants/api.constants.js";
import CategoryModel from "@/model/category.model.js";
import PostModel from "@/model/post.model.js";
import AppError from "@/utils/AppError.js";
import slugifyLib from "slugify";
import { getOrSet, deleteCache, deleteCachePattern } from "@/helpers/cache.helper.js";

const slugify = slugifyLib.default || slugifyLib;

const CACHE_KEYS = {
    ALL_CATEGORIES: "categories:all",
    ACTIVE_CATEGORIES: "categories:active",
    CATEGORY: (id: string) => `category:${id}`,
    CATEGORY_SLUG: (slug: string) => `category:slug:${slug}`,
};

const CACHE_TTL = 600; // 10 minutes

// ---- Create Category (Admin) ----
export interface CreateCategoryInput {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export const createCategory = async (data: CreateCategoryInput) => {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existingCategory = await CategoryModel.findOne({
        $or: [{ name: data.name }, { slug }],
    });

    if (existingCategory) {
        throw new AppError("Category already exists", HTTP_STATUS.CONFLICT);
    }

    const category = new CategoryModel({
        name: data.name,
        slug,
        description: data.description,
        color: data.color || "#6366f1",
        icon: data.icon,
        postCount: 0,
        isActive: true,
    });

    await category.save();
    await invalidateCategoryCache();

    return category;
};

// ---- Get All Categories ----
export const getAllCategories = async (activeOnly: boolean = true) => {
    const cacheKey = activeOnly ? CACHE_KEYS.ACTIVE_CATEGORIES : CACHE_KEYS.ALL_CATEGORIES;

    return getOrSet(
        cacheKey,
        async () => {
            const filter = activeOnly ? { isActive: true } : {};
            return CategoryModel.find(filter).sort({ name: 1 }).lean();
        },
        CACHE_TTL
    );
};

// ---- Get Category by ID or Slug ----
export const getCategoryByIdOrSlug = async (identifier: string) => {
    const isObjectId = identifier.length === 24 && /^[0-9a-fA-F]{24}$/.test(identifier);
    const cacheKey = isObjectId
        ? CACHE_KEYS.CATEGORY(identifier)
        : CACHE_KEYS.CATEGORY_SLUG(identifier);

    return getOrSet(
        cacheKey,
        async () => {
            const category = await CategoryModel.findOne(
                isObjectId ? { _id: identifier } : { slug: identifier }
            ).lean();

            if (!category) {
                throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
            }

            return category;
        },
        CACHE_TTL
    );
};

// ---- Update Category (Admin) ----
export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}

export const updateCategory = async (categoryId: string, data: UpdateCategoryInput) => {
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
        throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
    }

    if (data.name && data.name !== category.name) {
        const slug = slugify(data.name, { lower: true, strict: true });
        const existingCategory = await CategoryModel.findOne({
            $or: [{ name: data.name }, { slug }],
            _id: { $ne: categoryId },
        });

        if (existingCategory) {
            throw new AppError("Category name already exists", HTTP_STATUS.CONFLICT);
        }

        category.name = data.name;
        category.slug = slug;
    }

    if (data.description !== undefined) category.description = data.description;
    if (data.color !== undefined) category.color = data.color;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await category.save();
    await invalidateCategoryCache();

    return category;
};

// ---- Delete Category (Admin) ----
export const deleteCategory = async (categoryId: string) => {
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
        throw new AppError("Category not found", HTTP_STATUS.NOT_FOUND);
    }

    // Remove category from all posts
    await PostModel.updateMany({ category: categoryId }, { $unset: { category: 1 } });

    await CategoryModel.findByIdAndDelete(categoryId);
    await invalidateCategoryCache();
    await deleteCachePattern("posts:*");

    return { message: "Category deleted successfully" };
};

// ---- Update Category Post Count ----
export const updateCategoryPostCount = async (categoryId: string) => {
    const count = await PostModel.countDocuments({
        category: categoryId,
        isPublished: true,
    });

    await CategoryModel.findByIdAndUpdate(categoryId, { postCount: count });
    await invalidateCategoryCache();
};

// ---- Get Categories with Post Counts ----
export const getCategoriesWithCounts = async () => {
    return getOrSet(
        "categories:with-counts",
        async () => {
            const categories = await CategoryModel.aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: "posts",
                        let: { categoryId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$category", "$$categoryId"] },
                                            { $eq: ["$isPublished", true] },
                                        ],
                                    },
                                },
                            },
                            { $count: "count" },
                        ],
                        as: "postStats",
                    },
                },
                {
                    $project: {
                        name: 1,
                        slug: 1,
                        description: 1,
                        color: 1,
                        icon: 1,
                        postCount: {
                            $ifNull: [{ $arrayElemAt: ["$postStats.count", 0] }, 0],
                        },
                    },
                },
                { $sort: { postCount: -1, name: 1 } },
            ]);

            return categories;
        },
        CACHE_TTL
    );
};

// ---- Get Popular Tags ----
export const getPopularTags = async (limit: number = 20) => {
    return getOrSet(
        `tags:popular:${limit}`,
        async () => {
            const tags = await PostModel.aggregate([
                { $match: { isPublished: true } },
                { $unwind: "$tags" },
                { $group: { _id: "$tags", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: limit },
                { $project: { tag: "$_id", count: 1, _id: 0 } },
            ]);

            return tags;
        },
        CACHE_TTL
    );
};

// ---- Invalidate Category Cache ----
const invalidateCategoryCache = async () => {
    await deleteCache(CACHE_KEYS.ALL_CATEGORIES);
    await deleteCache(CACHE_KEYS.ACTIVE_CATEGORIES);
    await deleteCache("categories:with-counts");
    await deleteCachePattern("category:*");
};
