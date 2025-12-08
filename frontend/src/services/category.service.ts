import api from "@/api/axios";
import { Category } from "@/types/post";

// API Response type
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode: number;
}

// Category with post count
export interface CategoryWithCount extends Category {
    postCount: number;
}

// Popular tag
export interface PopularTag {
    tag: string;
    count: number;
}

// Get all categories
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>("/categories");
    return response.data;
};

// Get categories with post counts
export const getCategoriesWithCounts = async (): Promise<ApiResponse<CategoryWithCount[]>> => {
    const response = await api.get<ApiResponse<CategoryWithCount[]>>("/categories/with-counts");
    return response.data;
};

// Get popular tags
export const getPopularTags = async (): Promise<ApiResponse<PopularTag[]>> => {
    const response = await api.get<ApiResponse<PopularTag[]>>("/categories/tags/popular");
    return response.data;
};

// Get single category
export const getCategory = async (identifier: string): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${identifier}`);
    return response.data;
};
