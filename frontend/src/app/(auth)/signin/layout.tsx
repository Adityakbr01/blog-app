import type { Metadata } from "next";
import { AUTH_METADATA } from "@/constants/app";

export const metadata: Metadata = {
    title: AUTH_METADATA.signin.title,
    description: AUTH_METADATA.signin.description,
};

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
