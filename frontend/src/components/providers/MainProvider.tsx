"use client";
import React from "react";
import { TanStackProvider } from "./tanstack-provider";
import ReactToast from "./ReactToast";
import AuthProvider from "./AuthProvider";
import { Navbar } from "@/components/layouts";

function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    <TanStackProvider>
      <AuthProvider>
        <Navbar />
        <main className="max-w-8xl mx-auto w-full h-full pt-16">
          {children}
        </main>
        <ReactToast />
      </AuthProvider>
    </TanStackProvider>
  );
}

export default MainProvider;