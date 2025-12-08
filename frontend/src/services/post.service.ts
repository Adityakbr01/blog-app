import api from "@/api/axios";
import {
    ApiResponse,
    GetPostsQuery,
    GetPostsResponse,
    Post,
    CreatePostInput,
    UpdatePostInput,
    ToggleLikeResponse,
    TogglePublishResponse,
} from "@/types/post";

// Build query string from params
const buildQueryString = (params: GetPostsQuery): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};

// Get all posts with filters
export const getPosts = async (query: GetPostsQuery = {}): Promise<ApiResponse<GetPostsResponse>> => {
    const queryString = buildQueryString(query);
    const url = queryString ? `/blog?${queryString}` : "/blog";
    const response = await api.get<ApiResponse<GetPostsResponse>>(url);
    return response.data;
};

// Get single post by ID or slug
export const getPost = async (idOrSlug: string): Promise<ApiResponse<Post>> => {
    const response = await api.get<ApiResponse<Post>>(`/blog/${idOrSlug}`);
    return response.data;
};

// Get posts by user ID
export const getUserPosts = async (userId: string): Promise<ApiResponse<Post[]>> => {
    const response = await api.get<ApiResponse<Post[]>>(`/blog/user/${userId}`);
    return response.data;
};

// Get my posts (authenticated user)
export const getMyPosts = async (): Promise<ApiResponse<Post[]>> => {
    const response = await api.get<ApiResponse<Post[]>>("/blog/me/posts");
    return response.data;
};

// Create a new post
export const createPost = async (data: CreatePostInput): Promise<ApiResponse<Post>> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("content", data.content);

    if (data.category) formData.append("category", data.category);
    if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
    }
    if (data.isPublished !== undefined) {
        formData.append("isPublished", String(data.isPublished));
    }
    if (data.image) formData.append("image", data.image);

    const response = await api.post<ApiResponse<Post>>("/blog", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Update a post
export const updatePost = async (id: string, data: UpdatePostInput): Promise<ApiResponse<Post>> => {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.content) formData.append("content", data.content);
    if (data.category) formData.append("category", data.category);
    if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
    }
    if (data.isPublished !== undefined) {
        formData.append("isPublished", String(data.isPublished));
    }
    if (data.image) formData.append("image", data.image);

    const response = await api.put<ApiResponse<Post>>(`/blog/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Delete a post
export const deletePost = async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/blog/${id}`);
    return response.data;
};

// Toggle like on a post
export const toggleLike = async (id: string): Promise<ApiResponse<ToggleLikeResponse>> => {
    const response = await api.post<ApiResponse<ToggleLikeResponse>>(`/blog/${id}/like`);
    return response.data;
};

// Toggle publish status
export const togglePublish = async (id: string): Promise<ApiResponse<TogglePublishResponse>> => {
    const response = await api.patch<ApiResponse<TogglePublishResponse>>(`/blog/${id}/publish`);
    return response.data;
};
