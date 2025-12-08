/**
 * Redis Key Helper
 * Centralized key management for Redis caching
 */

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    POST: 300, // 5 minutes
    POST_LIST: 180, // 3 minutes
    COMMENT: 300, // 5 minutes
    USER: 600, // 10 minutes
    USER_POSTS: 180, // 3 minutes
} as const;

// Key prefixes
const PREFIX = {
    POST: "post",
    POST_LIST: "posts",
    COMMENT: "comment",
    COMMENTS: "comments",
    USER: "user",
    USER_POSTS: "user_posts",
} as const;

/**
 * Generate Redis keys for different entities
 */
export const redisKeys = {
    // Post keys
    post: (id: string) => `${PREFIX.POST}:${id}`,
    postBySlug: (slug: string) => `${PREFIX.POST}:slug:${slug}`,
    postList: (query: string) => `${PREFIX.POST_LIST}:${query}`,
    userPosts: (userId: string, includeUnpublished: boolean) =>
        `${PREFIX.USER_POSTS}:${userId}:${includeUnpublished}`,

    // Comment keys
    comment: (id: string) => `${PREFIX.COMMENT}:${id}`,
    postComments: (postId: string, page: number, limit: number) =>
        `${PREFIX.COMMENTS}:post:${postId}:p${page}:l${limit}`,
    commentReplies: (commentId: string) => `${PREFIX.COMMENTS}:replies:${commentId}`,

    // User keys
    user: (id: string) => `${PREFIX.USER}:${id}`,
    userByEmail: (email: string) => `${PREFIX.USER}:email:${email}`,

    // Pattern keys for invalidation
    patterns: {
        allPosts: () => `${PREFIX.POST}*`,
        allPostLists: () => `${PREFIX.POST_LIST}*`,
        allUserPosts: (userId: string) => `${PREFIX.USER_POSTS}:${userId}*`,
        allPostComments: (postId: string) => `${PREFIX.COMMENTS}:post:${postId}*`,
        allCommentReplies: (commentId: string) => `${PREFIX.COMMENTS}:replies:${commentId}*`,
    },
};

/**
 * Generate a hash from query parameters for cache key
 */
export const hashQuery = (query: Record<string, unknown>): string => {
    const sorted = Object.keys(query)
        .sort()
        .reduce(
            (acc, key) => {
                acc[key] = query[key];
                return acc;
            },
            {} as Record<string, unknown>
        );
    return Buffer.from(JSON.stringify(sorted)).toString("base64").slice(0, 32);
};
