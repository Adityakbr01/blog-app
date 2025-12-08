import { HTTP_STATUS } from "@/constants/api.constants.js";
import UserModel from "@/model/user.model.js";
import AppError from "@/utils/AppError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinaryUpload.js";
import { UpdateProfileInput, ChangePasswordInput } from "@/validations/user.schema.js";
import { invalidateUserCache, getOrSet, redisKeys, CACHE_TTL } from "@/helpers/index.js";

// ---- Get User Profile ----
export const getUserProfile = async (userId: string) => {
    const cacheKey = redisKeys.user(userId);

    return getOrSet(
        cacheKey,
        async () => {
            const user = await UserModel.findById(userId).select(
                "-password -refreshTokens -otp"
            );

            if (!user) {
                throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
            }

            return user.toObject();
        },
        CACHE_TTL.USER
    );
};

// ---- Get Public User Profile ----
export const getPublicProfile = async (identifier: string) => {
    // Check if identifier is ObjectId or username
    const isObjectId =
        identifier.length === 24 && /^[0-9a-fA-F]{24}$/.test(identifier);

    const user = await UserModel.findOne(
        isObjectId ? { _id: identifier } : { username: identifier }
    ).select("name username bio avatar createdAt");

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return user;
};

// ---- Update User Profile ----
export const updateProfile = async (
    userId: string,
    data: UpdateProfileInput,
    avatarBuffer?: Buffer
) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if username is taken
    if (data.username && data.username !== user.username) {
        const existingUser = await UserModel.findOne({ username: data.username });
        if (existingUser) {
            throw new AppError("Username is already taken", HTTP_STATUS.CONFLICT);
        }
        user.username = data.username;
    }

    // Handle avatar upload
    if (avatarBuffer) {
        // Delete old avatar if exists
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        const uploadResult = await uploadToCloudinary(
            avatarBuffer,
            "user-avatars",
            `avatar-${userId}`
        );
        user.avatar = uploadResult.secureUrl;
        user.avatarPublicId = uploadResult.publicId;
    }

    // Update other fields
    if (data.name !== undefined) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;

    await user.save();

    // Invalidate cache
    await invalidateUserCache(userId);

    // Return user without sensitive data
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, refreshTokens: _tokens, otp: _otp, ...safeUser } = userObj;

    return safeUser;
};

// ---- Change Password ----
export const changePassword = async (
    userId: string,
    data: ChangePasswordInput
) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password using model's comparePassword method
    const isValidPassword = await user.comparePassword(data.currentPassword);
    if (!isValidPassword) {
        throw new AppError("Current password is incorrect", HTTP_STATUS.BAD_REQUEST);
    }

    // Update password (will be auto-hashed by model pre-save hook)
    user.password = data.newPassword;

    // Clear all refresh tokens for security
    user.refreshTokens = [];

    await user.save();

    // Invalidate cache
    await invalidateUserCache(userId);

    return { message: "Password changed successfully. Please login again." };
};

// ---- Delete Avatar ----
export const deleteAvatar = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!user.avatarPublicId) {
        throw new AppError("No avatar to delete", HTTP_STATUS.BAD_REQUEST);
    }

    await deleteFromCloudinary(user.avatarPublicId);
    user.avatar = undefined;
    user.avatarPublicId = undefined;
    await user.save();

    // Invalidate cache
    await invalidateUserCache(userId);

    // Return user without sensitive data
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, refreshTokens: _tokens, otp: _otp, ...safeUser } = userObj;

    return safeUser;
};

// ---- Check Username Availability ----
export const checkUsernameAvailable = async (username: string) => {
    const existingUser = await UserModel.findOne({ username: username.toLowerCase() });
    return { available: !existingUser };
};
