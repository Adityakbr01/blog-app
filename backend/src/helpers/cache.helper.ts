import redis from "@/config/redis.js";
import logger from "@/utils/logger.js";

/**
 * Redis Cache Helper
 * Provides utility functions for caching operations
 * Compatible with node-redis v4+
 */

/**
 * Get cached data or fetch from source
 */
export const getOrSet = async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
): Promise<T> => {
    try {
        const cached = await redis.get(key);
        if (cached) {
            logger.debug(`Cache HIT: ${key}`);
            return JSON.parse(cached) as T;
        }

        logger.debug(`Cache MISS: ${key}`);
        const data = await fetchFn();
        await redis.setEx(key, ttl, JSON.stringify(data));
        return data;
    } catch (error) {
        logger.error(`Redis getOrSet error for key ${key}:`, error);
        // Fallback to fetch function if Redis fails
        return fetchFn();
    }
};

/**
 * Set cache with TTL
 */
export const setCache = async <T>(key: string, data: T, ttl: number): Promise<void> => {
    try {
        await redis.setEx(key, ttl, JSON.stringify(data));
        logger.debug(`Cache SET: ${key}`);
    } catch (error) {
        logger.error(`Redis setCache error for key ${key}:`, error);
    }
};

/**
 * Get cached data
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const cached = await redis.get(key);
        if (cached) {
            logger.debug(`Cache GET: ${key}`);
            return JSON.parse(cached) as T;
        }
        return null;
    } catch (error) {
        logger.error(`Redis getCache error for key ${key}:`, error);
        return null;
    }
};

/**
 * Delete single cache key
 */
export const deleteCache = async (key: string): Promise<void> => {
    try {
        await redis.del(key);
        logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
        logger.error(`Redis deleteCache error for key ${key}:`, error);
    }
};

/**
 * Delete multiple cache keys by pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<void> => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
        }
    } catch (error) {
        logger.error(`Redis deleteCachePattern error for pattern ${pattern}:`, error);
    }
};

/**
 * Delete multiple specific keys
 */
export const deleteMultipleKeys = async (keys: string[]): Promise<void> => {
    try {
        if (keys.length > 0) {
            await redis.del(keys);
            logger.debug(`Cache DEL multiple: ${keys.length} keys`);
        }
    } catch (error) {
        logger.error(`Redis deleteMultipleKeys error:`, error);
    }
};

/**
 * Invalidate all caches related to a post
 */
export const invalidatePostCache = async (postId: string, authorId: string): Promise<void> => {
    const patterns = [
        `post:${postId}`,
        `post:slug:*`,
        `posts:*`,
        `user_posts:${authorId}*`,
        `comments:post:${postId}*`,
    ];

    for (const pattern of patterns) {
        await deleteCachePattern(pattern);
    }
};

/**
 * Invalidate all caches related to a comment
 */
export const invalidateCommentCache = async (postId: string, commentId?: string): Promise<void> => {
    const patterns = [`comments:post:${postId}*`];

    if (commentId) {
        patterns.push(`comment:${commentId}`);
        patterns.push(`comments:replies:${commentId}*`);
    }

    for (const pattern of patterns) {
        await deleteCachePattern(pattern);
    }
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = async (userId: string): Promise<void> => {
    await deleteCachePattern(`user:${userId}*`);
    await deleteCachePattern(`user_posts:${userId}*`);
};
