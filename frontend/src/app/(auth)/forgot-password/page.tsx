"use client";

import ForgotPassword from "@/components/pages/ForgotPassword";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Page() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace("/");
        }
    }, [user, router]);

    if (user) return null;

    return (
        <main className="min-h-screen w-screen flex items-center justify-center text-white">
            <ForgotPassword />
        </main>
    );
}

export default Page;
