"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { FieldErrors, UseFormReturn } from "react-hook-form";
import Link from "next/link";
import { ForgotPasswordFormData } from "@/validations/auth.schema";

export interface EmailForgotStepProps {
    form: UseFormReturn<ForgotPasswordFormData>;
    loading: boolean;
    errors: FieldErrors<ForgotPasswordFormData>;
    onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
}

function EmailForgotStep({ form, loading, errors, onSubmit }: EmailForgotStepProps) {
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {errors.root && <p className="text-xs text-red-500">{errors.root?.message}</p>}

            <p className="text-[12px] text-[#a6a6a6] font-light">
                Enter your email address and we&apos;ll send you a verification code to reset your password.
            </p>

            {/* Email Field */}
            <div className="space-y-1">
                <Label
                    htmlFor="email"
                    className="text-[#a6a6a6] text-[12px] font-HelveticaNow font-medium"
                >
                    Email address
                </Label>
                <input
                    id="email"
                    placeholder="Enter your email address"
                    type="email"
                    {...form.register("email")}
                    className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 font-light placeholder:text-[12px]"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                    className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-(--custom-primary) hover:bg-(--custom-primary) cursor-pointer text-black"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Code"}
                </Button>
            </div>

            {/* Sign In Link */}
            <p className="text-[12px] text-[#a6a6a6] text-center mt-4">
                Remember your password?{" "}
                <Link href="/signin" className="text-blue-500 hover:underline">
                    Sign In
                </Link>
            </p>
        </form>
    );
}

export default EmailForgotStep;
