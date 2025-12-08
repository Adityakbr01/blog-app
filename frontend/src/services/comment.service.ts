import api from "@/api/axios";
import {
    ApiResponse,
    Comment,
    GetCommentsQuery,
    GetCommentsResponse,
    CreateCommentInput,
    UpdateCommentInput,
} from "@/types/comment";

// Build query string from params
const buildQueryString = (params: GetCommentsQuery): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};

// Get comments for a post
export const getComments = async (
    postId: string,
    query: GetCommentsQuery = {}
): Promise<ApiResponse<GetCommentsResponse>> => {
    const queryString = buildQueryString(query);
    const url = queryString
        ? `/comments/post/${postId}?${queryString}`
        : `/comments/post/${postId}`;
    const response = await api.get<ApiResponse<GetCommentsResponse>>(url);
    return response.data;
};

// Get single comment by ID
export const getComment = async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await api.get<ApiResponse<Comment>>(`/comments/${id}`);
    return response.data;
};

// Get replies for a comment
export const getReplies = async (id: string): Promise<ApiResponse<Comment[]>> => {
    const response = await api.get<ApiResponse<Comment[]>>(`/comments/${id}/replies`);
    return response.data;
};

// Create a new comment
export const createComment = async (
    postId: string,
    data: CreateCommentInput
): Promise<ApiResponse<Comment>> => {
    const response = await api.post<ApiResponse<Comment>>(
        `/comments/post/${postId}`,
        data
    );
    return response.data;
};

// Update a comment
export const updateComment = async (
    id: string,
    data: UpdateCommentInput
): Promise<ApiResponse<Comment>> => {
    const response = await api.put<ApiResponse<Comment>>(`/comments/${id}`, data);
    return response.data;
};

// Delete a comment
export const deleteComment = async (
    id: string
): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
        `/comments/${id}`
    );
    return response.data;
};
