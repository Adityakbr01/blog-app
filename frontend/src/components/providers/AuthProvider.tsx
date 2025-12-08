"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import * as authService from "@/services/auth.service";

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * AuthProvider - Handles automatic user authentication on app startup
 * - Fetches user profile if access token exists
 * - Attempts to refresh token on 401 errors
 * - Clears auth on failure
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const { accessToken, setAccessToken, setUser, clearAuth } = useAuthStore();

    useEffect(() => {
        const initializeAuth = async () => {
            // If no access token, try to refresh first
            if (!accessToken) {
                try {
                    const refreshResponse = await authService.refreshToken();
                    if (refreshResponse.data?.accessToken) {
                        setAccessToken(refreshResponse.data.accessToken);
                        // Fetch user profile with new token
                        const profileResponse = await authService.getProfile();
                        if (profileResponse.data) {
                            setUser(profileResponse.data);
                        }
                    }
                } catch {
                    // No valid session, clear any stale data
                    clearAuth();
                }
                setIsInitialized(true);
                return;
            }

            // If we have an access token, fetch user profile
            try {
                const response = await authService.getProfile();
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                // On 401, the axios interceptor will handle refresh automatically
                // If refresh also fails, clearAuth will be called by the interceptor
                console.error("Failed to fetch user profile:", error);
            }
            setIsInitialized(true);
        };

        initializeAuth();
    }, [accessToken, setAccessToken, setUser, clearAuth]);

    // Optional: Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-(--custom-primary)"></div>
            </div>
        );
    }

    return <>{children}</>;
}

export default AuthProvider;
