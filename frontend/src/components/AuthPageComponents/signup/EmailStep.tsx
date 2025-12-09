
"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FieldErrors, UseFormReturn } from "react-hook-form";
import { EmailFormData } from "./EmailSignUpForm";
import Link from "next/link";


// Email Step Component
export interface EmailStepProps {
    form: UseFormReturn<EmailFormData>;
    showPassword: boolean;
    togglePassword: () => void;
    loading: boolean;
    errors: FieldErrors<EmailFormData>;
    onSubmit: (data: EmailFormData) => Promise<void>;
}

function EmailStep({ form, showPassword, togglePassword, loading, errors, onSubmit }: EmailStepProps) {
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {errors.root && <p className="text-xs text-red-500">{errors.root?.message}</p>}

            {/* Name Field */}
            <div className="space-y-1">
                <Label
                    htmlFor="name"
                    className="text-[#a6a6a6] text-[12px] font-HelveticaNow font-medium"
                >
                    Full Name
                </Label>
                <input
                    id="name"
                    placeholder="Enter your full name"
                    type="text"
                    {...form.register("name")}
                    className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 font-light placeholder:text-[12px]"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

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

            {/* Password Field */}
            <div className="space-y-1 relative">
                <Label
                    htmlFor="password"
                    className="text-[#a6a6a6] text-[12px] font-HelveticaNow font-medium"
                >
                    Password
                </Label>
                <input
                    id="password"
                    placeholder="Enter your password (min 8 characters)"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 pr-10 font-light placeholder:text-[12px]"
                />
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-2 top-[65%] transform cursor-pointer -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Sign Up Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={loading}
                    className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-(--custom-primary) hover:bg-(--custom-primary) cursor-pointer text-black"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign Up"}
                </Button>
            </div>

            {/* Sign In Link */}
            <p className="text-[12px] text-[#a6a6a6] text-center mt-4">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-500 hover:underline">
                    Sign In
                </Link>
            </p>
        </form>
    );
}

export default EmailStep;