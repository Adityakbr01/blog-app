import { useQuery } from "@tanstack/react-query";
import * as categoryService from "@/services/category.service";

// Query Keys
export const categoryKeys = {
    all: ["categories"] as const,
    lists: () => [...categoryKeys.all, "list"] as const,
    withCounts: () => [...categoryKeys.all, "with-counts"] as const,
    popularTags: () => [...categoryKeys.all, "popular-tags"] as const,
    detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
};

// ---- useGetCategories Hook ----
export const useGetCategories = () => {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: () => categoryService.getCategories(),
        staleTime: 1000 * 60 * 10, // 10 minutes - categories don't change often
    });
};

// ---- useGetCategoriesWithCounts Hook ----
export const useGetCategoriesWithCounts = () => {
    return useQuery({
        queryKey: categoryKeys.withCounts(),
        queryFn: () => categoryService.getCategoriesWithCounts(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// ---- useGetPopularTags Hook ----
export const useGetPopularTags = () => {
    return useQuery({
        queryKey: categoryKeys.popularTags(),
        queryFn: () => categoryService.getPopularTags(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// ---- useGetCategory Hook ----
export const useGetCategory = (identifier: string) => {
    return useQuery({
        queryKey: categoryKeys.detail(identifier),
        queryFn: () => categoryService.getCategory(identifier),
        enabled: !!identifier,
    });
};
