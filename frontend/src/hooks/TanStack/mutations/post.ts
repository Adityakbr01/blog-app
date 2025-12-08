import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as postService from "@/services/post.service";
import { GetPostsQuery, CreatePostInput, UpdatePostInput, Post } from "@/types/post";
import { ApiResponse } from "@/types/auth";
import toast from "react-hot-toast";

// Query Keys
export const postKeys = {
    all: ["posts"] as const,
    lists: () => [...postKeys.all, "list"] as const,
    list: (query: GetPostsQuery) => [...postKeys.lists(), query] as const,
    details: () => [...postKeys.all, "detail"] as const,
    detail: (id: string) => [...postKeys.details(), id] as const,
    userPosts: (userId: string) => [...postKeys.all, "user", userId] as const,
    myPosts: () => [...postKeys.all, "my"] as const,
};

// ---- useGetPosts Hook ----
export const useGetPosts = (query: GetPostsQuery = {}) => {
    return useQuery({
        queryKey: postKeys.list(query),
        queryFn: () => postService.getPosts(query),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// ---- useGetPost Hook ----
export const useGetPost = (idOrSlug: string) => {
    return useQuery({
        queryKey: postKeys.detail(idOrSlug),
        queryFn: () => postService.getPost(idOrSlug),
        enabled: !!idOrSlug,
    });
};

// ---- useGetUserPosts Hook ----
export const useGetUserPosts = (userId: string) => {
    return useQuery({
        queryKey: postKeys.userPosts(userId),
        queryFn: () => postService.getUserPosts(userId),
        enabled: !!userId,
    });
};

// ---- useGetMyPosts Hook ----
export const useGetMyPosts = () => {
    return useQuery({
        queryKey: postKeys.myPosts(),
        queryFn: () => postService.getMyPosts(),
    });
};

// ---- useCreatePost Hook ----
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePostInput) => postService.createPost(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.myPosts() });
            toast.success(response.message || "Post created successfully");
        },
    });
};

// ---- useUpdatePost Hook ----
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) =>
            postService.updatePost(id, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.myPosts() });
            toast.success(response.message || "Post updated successfully");
        },
    });
};

// ---- useDeletePost Hook ----
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.deletePost(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.myPosts() });
            toast.success(response.message || "Post deleted successfully");
        },
    });
};

// ---- useToggleLike Hook with Optimistic Updates ----
export const useToggleLike = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.toggleLike(id),
        // Optimistic update for instant UI feedback
        onMutate: async (postId: string) => {
            if (!userId) return;

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: postKeys.details() });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({ queryKey: postKeys.details() });

            // Optimistically update all cached post details
            queryClient.setQueriesData(
                { queryKey: postKeys.details() },
                (old: ApiResponse<Post> | undefined) => {
                    if (!old?.data) return old;
                    const post = old.data;

                    // Check if this is the post we're updating
                    if (post._id !== postId && post.slug !== postId) return old;

                    // Safely check if user already liked - handle both string[] and object[] cases
                    const likesArray = post.likes || [];
                    const isCurrentlyLiked = likesArray.some((like) => {
                        if (typeof like === "string") {
                            return like === userId;
                        }
                        // Handle case where likes might be objects with _id
                        if (typeof like === "object" && like !== null) {
                            return (like as { _id?: string })._id === userId;
                        }
                        return false;
                    });

                    // Calculate new likes array
                    const newLikes = isCurrentlyLiked
                        ? likesArray.filter((like) => {
                            if (typeof like === "string") return like !== userId;
                            if (typeof like === "object" && like !== null) {
                                return (like as { _id?: string })._id !== userId;
                            }
                            return true;
                        })
                        : [...likesArray, userId];

                    return {
                        ...old,
                        data: {
                            ...post,
                            likes: newLikes as string[],
                            likesCount: isCurrentlyLiked
                                ? Math.max(0, post.likesCount - 1)
                                : post.likesCount + 1,
                        },
                    };
                }
            );

            return { previousData };
        },
        onError: (_err, _postId, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error("Failed to update like");
        },
        onSettled: (_data, _error, postId) => {
            // Always refetch after error or success to sync with server
            queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
        },
    });
};

// ---- useTogglePublish Hook ----
export const useTogglePublish = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postService.togglePublish(id),
        onSuccess: (response, id) => {
            queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.myPosts() });
            toast.success(response.data?.message || "Post status updated");
        },
    });
};
