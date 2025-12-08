import { useMutation } from "@tanstack/react-query";
import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { SignupInput, LoginInput, VerifyOtpInput, ResendOtpInput, ResetPasswordInput, ForgotPasswordInput } from "@/types/auth";
import toast from "react-hot-toast";

// ---- useSignup Hook ----
export const useSignup = () => {
    return useMutation({
        mutationFn: (data: SignupInput) => authService.signup(data),
        onSuccess: (response) => {
            toast.success(response.message || "OTP sent to your email");
        },
    });
};

// ---- useLogin Hook ----
export const useLogin = () => {
    const { setAccessToken, setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: (data: LoginInput) => authService.login(data),
        onSuccess: (response) => {
            if (response.data) {
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
                toast.success(response.message || "Login successful");
            }
        },
    });
};

// ---- useVerifyOtp Hook ----
export const useVerifyOtp = () => {
    const { setAccessToken, setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: (data: VerifyOtpInput) => authService.verifyOtp(data),
        onSuccess: (response) => {
            if (response.data) {
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
                toast.success(response.message || "Email verified successfully");
            }
        },
    });
};

// ---- useResendOtp Hook ----
export const useResendOtp = () => {
    return useMutation({
        mutationFn: (data: ResendOtpInput) => authService.resendOtp(data),
        onSuccess: (response) => {
            toast.success(response.message || "OTP sent successfully");
        },
    });
};

// ---- useLogout Hook ----
export const useLogout = () => {
    const { clearAuth } = useAuthStore.getState();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            clearAuth();
            toast.success("Logged out successfully");
        },
        onError: () => {
            // Clear auth even on error
            clearAuth();
        },
    });
};

// ---- useForgotPassword Hook ----
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordInput) => authService.forgotPassword(data),
        onSuccess: (response) => {
            toast.success(response.message || "OTP sent to your email");
        },
    });
};

// ---- useResetPassword Hook ----
export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordInput) => authService.resetPassword(data),
        onSuccess: (response) => {
            toast.success(response.message || "Password reset successful");
        },
    });
};
