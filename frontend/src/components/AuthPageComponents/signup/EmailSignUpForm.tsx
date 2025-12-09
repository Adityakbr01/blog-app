"use client";
import { useSignup } from "@/hooks/TanStack/mutations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signupSchema, SignupFormData } from "@/validations/auth.schema";
import EmailStep from "./EmailStep";

// Export types for child components
export type EmailFormData = SignupFormData;

function EmailSignUpForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const signupMutation = useSignup();

    // Signup Form (name, email, password)
    const emailForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onEmailSubmit = async (data: SignupFormData) => {
        signupMutation.mutate(data, {
            onSuccess: () => {
                emailForm.reset();
                router.push("/"); // Redirect to home after successful signup
            },
            onError: (error: unknown) => {
                if (error instanceof AxiosError) {
                    emailForm.setError("root", {
                        message: error?.response?.data?.message || "Something went wrong",
                    });
                }
            },
        });
    };

    const { errors: emailErrors } = emailForm.formState;

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <EmailStep
            form={emailForm}
            showPassword={showPassword}
            togglePassword={togglePassword}
            loading={signupMutation.isPending}
            errors={emailErrors}
            onSubmit={onEmailSubmit}
        />
    );
}

export default EmailSignUpForm;