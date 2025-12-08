import { Request, Response } from "express";
import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as CategoryService from "@/services/category.service.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { asyncWrap } from "@/utils/asyncWrap.js";

// ---- Get All Categories ----
export const getAllCategories = asyncWrap(async (req: Request, res: Response) => {
    const activeOnly = req.query.active !== "false";
    const categories = await CategoryService.getAllCategories(activeOnly);

    return sendResponse(res, HTTP_STATUS.OK, "Categories retrieved successfully", categories);
});

// ---- Get Categories with Post Counts ----
export const getCategoriesWithCounts = asyncWrap(async (_req: Request, res: Response) => {
    const categories = await CategoryService.getCategoriesWithCounts();

    return sendResponse(res, HTTP_STATUS.OK, "Categories with counts retrieved successfully", categories);
});

// ---- Get Single Category ----
export const getCategory = asyncWrap(async (req: Request, res: Response) => {
    const { identifier } = req.params;
    const category = await CategoryService.getCategoryByIdOrSlug(identifier);

    return sendResponse(res, HTTP_STATUS.OK, "Category retrieved successfully", category);
});

// ---- Create Category (Admin) ----
export const createCategory = asyncWrap(async (req: Request, res: Response) => {
    const category = await CategoryService.createCategory(req.body);

    return sendResponse(res, HTTP_STATUS.CREATED, "Category created successfully", category);
});

// ---- Update Category (Admin) ----
export const updateCategory = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await CategoryService.updateCategory(id, req.body);

    return sendResponse(res, HTTP_STATUS.OK, "Category updated successfully", category);
});

// ---- Delete Category (Admin) ----
export const deleteCategory = asyncWrap(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ---- Get Popular Tags ----
export const getPopularTags = asyncWrap(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const tags = await CategoryService.getPopularTags(limit);

    return sendResponse(res, HTTP_STATUS.OK, "Popular tags retrieved successfully", tags);
});
