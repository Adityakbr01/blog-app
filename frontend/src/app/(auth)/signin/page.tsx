"use client";

import SignIn from "@/components/pages/SignIn";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function Page() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/"); // redirect to home if already signed in
    }
  }, [user, router]);

  // Optional: prevent flashing the sign-in page while redirecting
  if (user) return null;

  return (
    <main className="min-h-screen w-screen flex items-center justify-center text-white">
      <SignIn />
    </main>
  );
}

export default Page;
