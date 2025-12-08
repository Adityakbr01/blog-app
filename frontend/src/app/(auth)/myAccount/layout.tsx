import type { Metadata } from "next";
import { AUTH_METADATA } from "@/constants/app";

export const metadata: Metadata = {
    title: AUTH_METADATA.myAccount.title,
    description: AUTH_METADATA.myAccount.description,
};

export default function MyAccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
