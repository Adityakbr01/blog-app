import { useMutation, useQuery } from "@tanstack/react-query";
import * as userService from "@/services/user.service";
import { useAuthStore } from "@/store/auth";
import { ChangePasswordInput, UpdateProfileInput } from "@/types/user";
import toast from "react-hot-toast";

// Query Keys
export const userKeys = {
    all: ["users"] as const,
    profiles: () => [...userKeys.all, "profile"] as const,
    profile: (identifier: string) => [...userKeys.profiles(), identifier] as const,
};

// ---- useGetPublicProfile Hook ----
export const useGetPublicProfile = (identifier: string) => {
    return useQuery({
        queryKey: userKeys.profile(identifier),
        queryFn: () => userService.getPublicProfile(identifier),
        enabled: !!identifier,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// ---- useUpdateAvatar Hook ----
export const useUpdateAvatar = () => {
    const { setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: (file: File) => userService.updateAvatar(file),
        onSuccess: (response) => {
            if (response.data?.user) {
                setUser(response.data.user);
                toast.success(response.message || "Avatar updated successfully");
            }
        },
        onError: () => {
            toast.error("Failed to update avatar");
        },
    });
};

// ---- useDeleteAvatar Hook ----
export const useDeleteAvatar = () => {
    const { setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: () => userService.deleteAvatar(),
        onSuccess: (response) => {
            if (response.data?.user) {
                setUser(response.data.user);
                toast.success(response.message || "Avatar deleted successfully");
            }
        },
        onError: () => {
            toast.error("Failed to delete avatar");
        },
    });
};

// ---- useChangePassword Hook ----
export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordInput) => userService.changePassword(data),
        onSuccess: (response) => {
            toast.success(response.message || "Password changed successfully");
        },
        onError: () => {
            toast.error("Failed to change password");
        },
    });
};

// ---- useUpdateProfile Hook ----
export const useUpdateProfile = () => {
    const { setUser } = useAuthStore.getState();

    return useMutation({
        mutationFn: (data: UpdateProfileInput) => userService.updateProfile(data),
        onSuccess: (response) => {
            if (response.data?.user) {
                setUser(response.data.user);
                toast.success(response.message || "Profile updated successfully");
            }
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });
};
