import api from "@/api/axios";
import {
    ApiResponse,
    SignupInput,
    SignupResponse,
    LoginInput,
    LoginResponse,
} from "@/types/auth";

// Signup - directly creates account and logs in
export const signup = async (data: SignupInput): Promise<ApiResponse<SignupResponse>> => {
    const response = await api.post<ApiResponse<SignupResponse>>("/auth/signup", data);
    return response.data;
};

// Login
export const login = async (data: LoginInput): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    return response.data;
};

// Logout
export const logout = async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
};

// Refresh token
export const refreshToken = async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
    return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<ApiResponse<import("@/types/auth").AuthUser>> => {
    const response = await api.get<ApiResponse<import("@/types/auth").AuthUser>>("/auth/profile");
    return response.data;
};
