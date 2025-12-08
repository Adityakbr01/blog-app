import api from "@/api/axios";
import {
    ApiResponse,
    SignupInput,
    SignupResponse,
    LoginInput,
    LoginResponse,
    VerifyOtpInput,
    VerifyOtpResponse,
    ResendOtpInput,
    ResendOtpResponse,
    ForgotPasswordInput,
    ForgotPasswordResponse,
    ResetPasswordInput,
} from "@/types/auth";

// Signup - sends OTP to email
export const signup = async (data: SignupInput): Promise<ApiResponse<SignupResponse>> => {
    const response = await api.post<ApiResponse<SignupResponse>>("/auth/signup", data);
    return response.data;
};

// Verify OTP and activate account
export const verifyOtp = async (data: VerifyOtpInput): Promise<ApiResponse<VerifyOtpResponse>> => {
    const response = await api.post<ApiResponse<VerifyOtpResponse>>("/auth/verify-otp", data);
    return response.data;
};

// Resend OTP
export const resendOtp = async (data: ResendOtpInput): Promise<ApiResponse<ResendOtpResponse>> => {
    const response = await api.post<ApiResponse<ResendOtpResponse>>("/auth/resend-otp", data);
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

// Forgot password - sends OTP
export const forgotPassword = async (data: ForgotPasswordInput): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const response = await api.post<ApiResponse<ForgotPasswordResponse>>("/auth/forgot-password", data);
    return response.data;
};

// Reset password
export const resetPassword = async (data: ResetPasswordInput): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
};

// Get current user profile
export const getProfile = async (): Promise<ApiResponse<import("@/types/auth").AuthUser>> => {
    const response = await api.get<ApiResponse<import("@/types/auth").AuthUser>>("/auth/profile");
    return response.data;
};
