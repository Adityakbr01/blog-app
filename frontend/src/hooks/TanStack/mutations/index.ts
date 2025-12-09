// Re-export all auth mutations
export {
    useSignup,
    useLogin,
    useLogout,
} from "./auth";

// Re-export all post mutations and queries
export {
    postKeys,
    useGetPosts,
    useGetPost,
    useGetUserPosts,
    useGetMyPosts,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
    useToggleLike,
    useTogglePublish,
} from "./post";

// Re-export all comment mutations and queries
export {
    commentKeys,
    useGetComments,
    useGetComment,
    useGetReplies,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
} from "./comment";

// Re-export all category queries
export {
    categoryKeys,
    useGetCategories,
    useGetCategoriesWithCounts,
    useGetPopularTags,
    useGetCategory,
} from "./category";

// Re-export user queries and mutations
export {
    userKeys,
    useGetPublicProfile,
    useUpdateAvatar,
    useDeleteAvatar,
    useChangePassword,
    useUpdateProfile,
} from "./user";
