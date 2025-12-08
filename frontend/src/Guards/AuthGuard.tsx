"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
    const user = useAuthStore((state) => state.user);
    const accessToken = useAuthStore((state) => state.accessToken);
    const router = useRouter();

    const isAuthenticated = useMemo(() => {
        return !!user && !!accessToken;
    }, [user, accessToken]);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.replace("/signin");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
}