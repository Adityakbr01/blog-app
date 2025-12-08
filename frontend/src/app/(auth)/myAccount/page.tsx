"use client";
import { useLogout } from "@/hooks/TanStack/mutations/auth";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import MyAccountSidebar from "../../../components/AuthPageComponents/myAccount/MyAccountSidebar";
import PersonalTab from "../../../components/AuthPageComponents/myAccount/PersonalTab";
import MyPostsTab from "../../../components/AuthPageComponents/myAccount/MyPostsTab";
import BookmarksTab from "../../../components/AuthPageComponents/myAccount/BookmarksTab";
import AuthGuard from "@/Guards/AuthGuard";

export default function AccountCenterSection() {
    const logoutMutation = useLogout();
    const [activeTab, setActiveTab] = useState("personal");
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const router = useRouter();

    console.log("User in MyAccount page:", user);

    useEffect(() => {
        if (!user) {
            router.push("/signin");
        }
    }, [user, router]);

    const renderTabContent = () => {
        switch (activeTab) {
            case "personal":
                return user ? (
                    <PersonalTab
                        user={user}
                        setUser={setUser}
                        logoutMutation={logoutMutation}
                    />
                ) : null;
            case "posts":
                return <MyPostsTab />;
            case "bookmarks":
                return <BookmarksTab />;
            default:
                return null;
        }
    };

    return (
        <AuthGuard>
            <section
                id="page1"
                className="flex flex-col md:flex-row w-full min-h-screen px-4 md:px-12 text-[var(--custom-textColor)] font-NeuMachina"
            >
                {/* Sidebar / Top Tabs */}
                <MyAccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Right Content */}
                <div className="flex-1 flex flex-col px-2 sm:px-6 md:px-10 py-10 md:py-20 md:mt-24 min-h-screen">
                    {renderTabContent()}
                </div>
            </section>
        </AuthGuard>
    );
}
