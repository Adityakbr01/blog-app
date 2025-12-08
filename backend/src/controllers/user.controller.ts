import { Request, Response } from 'express';
import { HTTP_STATUS } from '@/constants/api.constants.js';
import * as userService from '@/services/user.service.js';
import { sendResponse } from '@/utils/sendResponse.js';
import { asyncWrap } from '@/utils/asyncWrap.js';
import AppError from '@/utils/AppError.js';

/**
 * Get current user profile
 */
export const getProfile = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const profile = await userService.getUserProfile(userId);

    return sendResponse(res, HTTP_STATUS.OK, 'Profile fetched successfully', profile);
});

/**
 * Get public user profile by username or id
 */
export const getPublicProfile = asyncWrap(async (req: Request, res: Response) => {
    const { identifier } = req.params;

    const profile = await userService.getPublicProfile(identifier);

    return sendResponse(res, HTTP_STATUS.OK, 'Profile fetched successfully', profile);
});

/**
 * Update user profile (bio, name, username, avatar)
 */
export const updateProfile = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const avatarBuffer = req.file?.buffer;
    const updatedUser = await userService.updateProfile(userId, req.body, avatarBuffer);

    return sendResponse(res, HTTP_STATUS.OK, 'Profile updated successfully', { user: updatedUser });
});

/**
 * Change user password
 */
export const changePassword = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const result = await userService.changePassword(userId, req.body);

    return sendResponse(res, HTTP_STATUS.OK, result.message);
});

/**
 * Delete avatar
 */
export const deleteAvatar = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const updatedUser = await userService.deleteAvatar(userId);

    return sendResponse(res, HTTP_STATUS.OK, 'Avatar deleted successfully', { user: updatedUser });
});

/**
 * Check username availability
 */
export const checkUsername = asyncWrap(async (req: Request, res: Response) => {
    const { username } = req.params;

    const result = await userService.checkUsernameAvailable(username);

    return sendResponse(res, HTTP_STATUS.OK, result.available ? 'Username is available' : 'Username is taken', result);
});