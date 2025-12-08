// Post Types matching backend API responses
import { ApiResponse } from "./auth";

// Category Type
export interface Category {
    _id: string;
    name: string;
    slug: string;
    color?: string;
}

// Author Type (subset of user for posts)
export interface PostAuthor {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
}

// Post Type
export interface Post {
    _id: string;
    author: PostAuthor;
    category?: Category;
    title: string;
    slug: string;
    description: string;
    content: string;
    image?: string;
    tags: string[];
    isPublished: boolean;
    likes: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
}

// Pagination Type
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Get Posts Response
export interface GetPostsResponse {
    posts: Post[];
    pagination: Pagination;
}

// Get Posts Query Params
export interface GetPostsQuery {
    page?: number;
    limit?: number;
    search?: string;
    author?: string;
    category?: string;
    tag?: string;
    published?: "true" | "false";
    sortBy?: "createdAt" | "likesCount" | "commentsCount" | "title";
    sortOrder?: "asc" | "desc";
}

// Create Post Input
export interface CreatePostInput {
    title: string;
    description: string;
    content: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    image?: File;
}

// Update Post Input
export interface UpdatePostInput {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    image?: File;
}

// Toggle Like Response
export interface ToggleLikeResponse {
    liked: boolean;
    likesCount: number;
}

// Toggle Publish Response
export interface TogglePublishResponse {
    isPublished: boolean;
    message: string;
}

// Re-export for convenience
export type { ApiResponse };
