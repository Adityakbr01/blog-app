"use client";
import { useSignup, useVerifyOtp, useResendOtp } from "@/hooks/TanStack/mutations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { signupSchema, verifyOtpSchema, SignupFormData, VerifyOtpFormData } from "@/validations/auth.schema";
import EmailStep from "./EmailStep";
import OtpStep from "./OtpStep";
import { ROUTES } from "@/constants/app";

// Export types for child components
export type EmailFormData = SignupFormData;
export type OtpFormData = Omit<VerifyOtpFormData, 'email'>;

function EmailSignUpForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [step, setStep] = useState(1); // 1 = signup form, 2 = OTP verification
    const [resendMessage, setResendMessage] = useState("");
    const otpInputRef = useRef<HTMLInputElement>(null);

    const signupMutation = useSignup();
    const verifyOtpMutation = useVerifyOtp();
    const resendOtpMutation = useResendOtp();

    // Persist step - use queueMicrotask to avoid cascading render warning
    useEffect(() => {
        const savedStep = localStorage.getItem("authStep");
        const savedEmail = localStorage.getItem("authEmail");
        if (savedStep && savedEmail) {
            queueMicrotask(() => {
                setStep(parseInt(savedStep));
                setEmail(savedEmail);
            });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("authStep", step.toString());
        if (step > 1) {
            localStorage.setItem("authEmail", email);
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
                localStorage.removeItem("otpResendCount");
                localStorage.removeItem("otpLastResendTime");
            }
        };
    }, [step]);

    // Step 1: Signup Form (name, email, password)
    const emailForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onEmailSubmit = async (data: SignupFormData) => {
        setEmail(data.email);
        signupMutation.mutate(data, {
            onSuccess: () => {
                setStep(2); // Go to OTP step
            },
            onError: (error: unknown) => {
                if (error instanceof AxiosError) {
                    // If user already exists but pending, still go to OTP step
                    if (error.status === 409 && error.response?.data?.message?.includes("pending")) {
                        setStep(2);
                        return;
                    }
                    emailForm.setError("root", {
                        message: error?.response?.data?.message || "Something went wrong",
                    });
                }
            },
        });
    };

    // Step 2: OTP Verification
    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(verifyOtpSchema.omit({ email: true })),
        defaultValues: { otp: "" },
    });

    const onOtpSubmit = async (data: OtpFormData) => {
        verifyOtpMutation.mutate(
            { email, otp: data.otp },
            {
                onSuccess: () => {
                    // Cleanup
                    emailForm.reset();
                    otpForm.reset();
                    setEmail("");
                    setStep(1);
                    localStorage.removeItem("authStep");
                    localStorage.removeItem("authEmail");
                    localStorage.removeItem("otpResendCount");
                    localStorage.removeItem("otpLastResendTime");
                    router.push(ROUTES.SIGNIN); // Redirect to home after successful verification
                },
                onError: (error: unknown) => {
                    if (error instanceof AxiosError) {
                        otpForm.setError("otp", {
                            message: error?.response?.data?.message || "Invalid OTP",
                        });
                    }
                },
            }
        );
    };

    const handleResendOtp = async () => {
        setResendMessage("");

        resendOtpMutation.mutate(
            { email, type: "signup" },
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
            otpForm.reset();
            setResendMessage("");
        }
        setStep(step - 1);
    };

    const { errors: emailErrors } = emailForm.formState;
    const { errors: otpErrors } = otpForm.formState;

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <>
            {step === 1 ? (
                <EmailStep
                    form={emailForm}
                    showPassword={showPassword}
                    togglePassword={togglePassword}
                    loading={signupMutation.isPending}
                    errors={emailErrors}
                    onSubmit={onEmailSubmit}
                />
            ) : step === 2 ? (
                <OtpStep
                    form={otpForm}
                    email={email}
                    loading={verifyOtpMutation.isPending}
                    resendLoading={resendOtpMutation.isPending}
                    resendMessage={resendMessage}
                    onResend={handleResendOtp}
                    onBack={handleBack}
                    otpInputRef={otpInputRef}
                    errors={otpErrors}
                    onSubmit={onOtpSubmit}
                />
            ) : null}
        </>
    );
}

export default EmailSignUpForm;