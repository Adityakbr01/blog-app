import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as commentService from "@/services/comment.service";
import { GetCommentsQuery, CreateCommentInput, UpdateCommentInput } from "@/types/comment";
import toast from "react-hot-toast";
import { postKeys } from "./post";

// Query Keys
export const commentKeys = {
    all: ["comments"] as const,
    lists: () => [...commentKeys.all, "list"] as const,
    list: (postId: string, query: GetCommentsQuery) =>
        [...commentKeys.lists(), postId, query] as const,
    details: () => [...commentKeys.all, "detail"] as const,
    detail: (id: string) => [...commentKeys.details(), id] as const,
    replies: (id: string) => [...commentKeys.all, "replies", id] as const,
};

// ---- useGetComments Hook ----
export const useGetComments = (postId: string, query: GetCommentsQuery = {}) => {
    return useQuery({
        queryKey: commentKeys.list(postId, query),
        queryFn: () => commentService.getComments(postId, query),
        enabled: !!postId,
    });
};

// ---- useGetComment Hook ----
export const useGetComment = (id: string) => {
    return useQuery({
        queryKey: commentKeys.detail(id),
        queryFn: () => commentService.getComment(id),
        enabled: !!id,
    });
};

// ---- useGetReplies Hook ----
export const useGetReplies = (id: string) => {
    return useQuery({
        queryKey: commentKeys.replies(id),
        queryFn: () => commentService.getReplies(id),
        enabled: !!id,
    });
};

// ---- useCreateComment Hook ----
export const useCreateComment = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommentInput) =>
            commentService.createComment(postId, data),
        onSuccess: () => {
            // Invalidate comments list and post detail (for comment count)
            queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.details() });
            toast.success("Comment added!");
        },
    });
};

// ---- useUpdateComment Hook ----
export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCommentInput }) =>
            commentService.updateComment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
            toast.success("Comment updated!");
        },
    });
};

// ---- useDeleteComment Hook ----
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => commentService.deleteComment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: postKeys.details() });
            toast.success("Comment deleted!");
        },
    });
};
