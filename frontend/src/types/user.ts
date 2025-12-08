// User Types matching backend API responses
import { AuthUser, ApiResponse } from "./auth";

// User Response Types
export interface UpdateAvatarResponse {
    user: AuthUser;
}

export interface DeleteAvatarResponse {
    user: AuthUser;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface UpdateProfileResponse {
    user: AuthUser;
}

// User Input Types
export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateProfileInput {
    name?: string;
    username?: string;
    bio?: string;
}

// Re-export for convenience
export type { AuthUser, ApiResponse };
