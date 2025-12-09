// Auth Types matching backend API responses

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "blocked";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    bio?: string;
    createdAt?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

// Auth Response Types
export interface SignupResponse {
    user: AuthUser;
    accessToken: string;
}

export interface LoginResponse {
    user: AuthUser;
    accessToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

// Auth Input Types (matching backend schemas)
export interface SignupInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}
