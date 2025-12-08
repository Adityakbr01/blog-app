"use client";

import SignUp from "@/components/pages/SignUp";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

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
        <main className="min-h-screen w-full flex items-center justify-center text-white">
            <SignUp />
        </main>
    );
}

export default Page;