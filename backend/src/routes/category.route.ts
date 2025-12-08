import { Router } from "express";
import { authGuard } from "@/middlewares/authGuard.js";
import { adminGuard } from "@/middlewares/adminGuard.js";
import { validate } from "@/middlewares/system/validate.js";
import * as CategoryController from "@/controllers/category.controller.js";
import { createCategorySchema, updateCategorySchema } from "@/validations/category.schema.js";

const router = Router();

// ===================== PUBLIC ROUTES =====================
// Get all active categories
router.get("/", CategoryController.getAllCategories);

// Get categories with post counts (for sidebar/filter UI)
router.get("/with-counts", CategoryController.getCategoriesWithCounts);

// Get popular tags
router.get("/tags/popular", CategoryController.getPopularTags);

// Get single category by ID or slug
router.get("/:identifier", CategoryController.getCategory);

// ===================== ADMIN ROUTES =====================
// Create category
router.post(
    "/",
    authGuard,
    adminGuard,
    validate(createCategorySchema),
    CategoryController.createCategory
);

// Update category
router.patch(
    "/:id",
    authGuard,
    adminGuard,
    validate(updateCategorySchema),
    CategoryController.updateCategory
);

// Delete category
router.delete("/:id", authGuard, adminGuard, CategoryController.deleteCategory);

export default router;
