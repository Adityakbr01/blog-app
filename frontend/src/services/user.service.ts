import api from "@/api/axios";
import { ApiResponse } from "@/types/auth";
import {
    UpdateAvatarResponse,
    DeleteAvatarResponse,
    ChangePasswordInput,
    ChangePasswordResponse,
    UpdateProfileInput,
    UpdateProfileResponse,
} from "@/types/user";

// Update avatar - sends FormData with avatar file
export const updateAvatar = async (file: File): Promise<ApiResponse<UpdateAvatarResponse>> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.patch<ApiResponse<UpdateAvatarResponse>>("/users/me", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

// Delete avatar
export const deleteAvatar = async (): Promise<ApiResponse<DeleteAvatarResponse>> => {
    const response = await api.delete<ApiResponse<DeleteAvatarResponse>>("/users/me/avatar");
    return response.data;
};

// Change password
export const changePassword = async (data: ChangePasswordInput): Promise<ApiResponse<ChangePasswordResponse>> => {
    const response = await api.patch<ApiResponse<ChangePasswordResponse>>("/users/me/password", data);
    return response.data;
};

// Update profile
export const updateProfile = async (data: UpdateProfileInput): Promise<ApiResponse<UpdateProfileResponse>> => {
    const response = await api.patch<ApiResponse<UpdateProfileResponse>>("/users/me", data);
    return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<ApiResponse<{ user: import("@/types/auth").AuthUser }>> => {
    const response = await api.get<ApiResponse<{ user: import("@/types/auth").AuthUser }>>("/users/me");
    return response.data;
};

// Get public user profile by username or id
export const getPublicProfile = async (identifier: string): Promise<ApiResponse<PublicProfile>> => {
    const response = await api.get<ApiResponse<PublicProfile>>(`/users/profile/${identifier}`);
    return response.data;
};

// Public Profile Type
export interface PublicProfile {
    _id: string;
    name: string;
    username: string;
    bio?: string;
    avatar?: string;
    createdAt: string;
}
