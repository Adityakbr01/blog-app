import type { Metadata } from "next";
import { AUTH_METADATA } from "@/constants/app";

export const metadata: Metadata = {
    title: AUTH_METADATA.forgotPassword.title,
    description: AUTH_METADATA.forgotPassword.description,
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
