import { useMutation } from "@tanstack/react-query";
import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import { SignupInput, LoginInput } from "@/types/auth";
import toast from "react-hot-toast";

// ---- useSignup Hook ----
export const useSignup = () => {
    const { setAccessToken, setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: (data: SignupInput) => authService.signup(data),
        onSuccess: (response) => {
            if (response.data) {
                setAccessToken(response.data.accessToken);
                setUser(response.data.user);
                toast.success(response.message || "Account created successfully");
            }
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
