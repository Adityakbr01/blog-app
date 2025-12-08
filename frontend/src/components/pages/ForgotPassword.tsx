"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import ForgotPasswordForm from "../AuthPageComponents/forgotPassword/ForgotPasswordForm";

const tabs = [
    {
        id: 1,
        value: "email",
        label: "Email",
        content: <ForgotPasswordForm />,
        isAvailable: true,
    },
];

function ForgotPassword() {
    return (
        <div className="form-container flex flex-col items-center md:justify-between justify-center w-full gap-8 py-8 p-6">
            {/* Top */}
            <div className="top flex flex-col gap-4 w-full max-w-[400px]">
                <h1 className="text-4xl text-(--custom-textColor)">
                    Forgot Password
                    <p className="text-[1.1rem] font-light text-gray-400 mt-2">
                        Remember your password?{" "}
                        <Link href={"/signin"} className="text-blue-600 cursor-pointer">
                            Sign In
                        </Link>
                    </p>
                </h1>

                <Tabs defaultValue="email" className="w-full md:w-[400px] text-white">
                    <TabsList className="bg-transparent text-white flex gap-6 justify-center">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`relative group ${!tab.isAvailable ? "cursor-not-allowed" : ""}`}
                            >
                                <TabsTrigger value={tab.value} disabled={!tab.isAvailable} className="text-white">
                                    {tab.label}
                                </TabsTrigger>
                            </div>
                        ))}
                    </TabsList>

                    {tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.value}>
                            {tab.content}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default ForgotPassword;
