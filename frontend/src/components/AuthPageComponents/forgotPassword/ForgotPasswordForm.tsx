"use client";
import { useForgotPassword, useResetPassword, useResendOtp } from "@/hooks/TanStack/mutations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPasswordSchema, resetPasswordSchema, ForgotPasswordFormData } from "@/validations/auth.schema";
import EmailForgotStep from "./EmailForgotStep";
import ResetPasswordStep, { ResetPasswordStepFormData } from "./ResetPasswordStep";
import { ROUTES } from "@/constants/app";

function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1); // 1 = email form, 2 = OTP + new password
    const [resendMessage, setResendMessage] = useState("");
    const otpInputRef = useRef<HTMLInputElement>(null);

    const forgotPasswordMutation = useForgotPassword();
    const resetPasswordMutation = useResetPassword();
    const resendOtpMutation = useResendOtp();

    // Persist step - use queueMicrotask to avoid cascading render warning
    useEffect(() => {
        const savedStep = localStorage.getItem("forgotPasswordStep");
        const savedEmail = localStorage.getItem("forgotPasswordEmail");
        if (savedStep && savedEmail) {
            queueMicrotask(() => {
                setStep(parseInt(savedStep));
                setEmail(savedEmail);
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("forgotPasswordStep", step.toString());
        if (step > 1) {
            localStorage.setItem("forgotPasswordEmail", email);
        }
    }, [step, email]);

    // Auto focus OTP
    useEffect(() => {
        if (step === 2 && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (step !== 2) {
                localStorage.removeItem("forgotOtpResendCount");
                localStorage.removeItem("forgotOtpLastResendTime");
            }
        };
    }, [step]);

    // Step 1: Email Form
    const emailForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onEmailSubmit = async (data: ForgotPasswordFormData) => {
        setEmail(data.email);
        forgotPasswordMutation.mutate(data, {
            onSuccess: () => {
                setStep(2); // Go to reset password step
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

    // Step 2: OTP + New Password
    const resetForm = useForm<ResetPasswordStepFormData>({
        resolver: zodResolver(resetPasswordSchema.omit({ email: true })),
        defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
    });

    const onResetSubmit = async (data: ResetPasswordStepFormData) => {
        resetPasswordMutation.mutate(
            {
                email,
                otp: data.otp,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            },
            {
                onSuccess: () => {
                    // Cleanup
                    emailForm.reset();
                    resetForm.reset();
                    setEmail("");
                    setStep(1);
                    localStorage.removeItem("forgotPasswordStep");
                    localStorage.removeItem("forgotPasswordEmail");
                    localStorage.removeItem("forgotOtpResendCount");
                    localStorage.removeItem("forgotOtpLastResendTime");
                    router.push(ROUTES.SIGNIN); // Redirect to signin after successful reset
                },
                onError: (error: unknown) => {
                    if (error instanceof AxiosError) {
                        const message = error?.response?.data?.message || "Failed to reset password";
                        // Check if it's an OTP error
                        if (message.toLowerCase().includes("otp") || message.toLowerCase().includes("code")) {
                            resetForm.setError("otp", { message });
                        } else {
                            resetForm.setError("root", { message });
                        }
                    }
                },
            }
        );
    };

    const handleResendOtp = async () => {
        setResendMessage("");

        resendOtpMutation.mutate(
            { email, type: "forgot-password" },
            {
                onSuccess: (data) => {
                    setResendMessage(data.message || "OTP sent successfully");
                    setTimeout(() => setResendMessage(""), 3000);
                },
                onError: (err: unknown) => {
                    if (err instanceof AxiosError) {
                        setResendMessage(err?.response?.data?.message || "Failed to resend OTP");
                    }
                },
            }
        );
    };

    const handleBack = () => {
        if (step === 2) {
            resetForm.reset();
            setResendMessage("");
        }
        setStep(step - 1);
    };

    const { errors: emailErrors } = emailForm.formState;
    const { errors: resetErrors } = resetForm.formState;

    return (
        <>
            {step === 1 ? (
                <EmailForgotStep
                    form={emailForm}
                    loading={forgotPasswordMutation.isPending}
                    errors={emailErrors}
                    onSubmit={onEmailSubmit}
                />
            ) : step === 2 ? (
                <ResetPasswordStep
                    form={resetForm}
                    email={email}
                    loading={resetPasswordMutation.isPending}
                    resendLoading={resendOtpMutation.isPending}
                    resendMessage={resendMessage}
                    onResend={handleResendOtp}
                    onBack={handleBack}
                    otpInputRef={otpInputRef}
                    errors={resetErrors}
                    onSubmit={onResetSubmit}
                />
            ) : null}
        </>
    );
}

export default ForgotPasswordForm;
