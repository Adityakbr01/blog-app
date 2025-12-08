// Comment Types matching backend API responses
import { ApiResponse, Pagination } from "./post";

// Comment Author Type
export interface CommentAuthor {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

// Comment Type (recursive for nested replies)
export interface Comment {
    _id: string;
    post: string;
    author: CommentAuthor;
    content: string;
    parent: string | null;
    depth: number;
    replies: Comment[];
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

// Get Comments Response
export interface GetCommentsResponse {
    comments: Comment[];
    pagination: Pagination;
}

// Get Comments Query Params
export interface GetCommentsQuery {
    page?: number;
    limit?: number;
}

// Create Comment Input
export interface CreateCommentInput {
    content: string;
    parentId?: string;
}

// Update Comment Input
export interface UpdateCommentInput {
    content: string;
}

// Re-export for convenience
export type { ApiResponse };
