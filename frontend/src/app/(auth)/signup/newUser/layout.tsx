import type { Metadata } from "next";
import { AUTH_METADATA } from "@/constants/app";

export const metadata: Metadata = {
    title: AUTH_METADATA.signup.title,
    description: AUTH_METADATA.signup.description,
};

export default function SignUpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
