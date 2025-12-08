"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FieldErrors, UseFormReturn } from "react-hook-form";
import { OtpFormData } from "./EmailSignUpForm";

// OTP Step Component
export interface OtpStepProps {
    form: UseFormReturn<OtpFormData>;
    email: string;
    loading: boolean;
    resendLoading: boolean;
    resendMessage: string;
    onResend: () => void;
    onBack: () => void;
    otpInputRef: React.RefObject<HTMLInputElement | null>;
    errors: FieldErrors<OtpFormData>;
    onSubmit: (data: OtpFormData) => Promise<void>;
}

function OtpStep({
    form,
    loading,
    resendLoading,
    resendMessage,
    onResend,
    onBack,
    otpInputRef,
    errors,
    onSubmit
}: OtpStepProps) {
    const [countdown, setCountdown] = useState<number>(0);
    const [resendCount, setResendCount] = useState<number>(0);

    // Load saved resend count and last resend time from localStorage on mount
    useEffect(() => {
        const savedCount = localStorage.getItem('otpResendCount');
        const savedTime = localStorage.getItem('otpLastResendTime');

        queueMicrotask(() => {
            if (savedCount) {
                setResendCount(parseInt(savedCount, 10));
            }

            if (savedTime) {
                const lastTime = parseInt(savedTime, 10);
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - lastTime) / 1000);

                // If less than 60 seconds have passed, set the remaining countdown
                if (elapsedSeconds < 60) {
                    setCountdown(60 - elapsedSeconds);
                }
            }
        });
    }, []);

    // Handle countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    const handleResend = useCallback(() => {
        // Update resend count and save to localStorage
        const newCount = resendCount + 1;
        setResendCount(newCount);
        localStorage.setItem('otpResendCount', newCount.toString());

        // Set last resend time and start countdown
        localStorage.setItem('otpLastResendTime', Date.now().toString());
        setCountdown(60);

        // Call the original onResend function
        onResend();
    }, [resendCount, onResend]);

    const { ref: registerRef, onChange: registerOnChange, ...rest } = form.register("otp");

    const handleRef = useCallback((node: HTMLInputElement | null) => {
        registerRef(node);
        otpInputRef.current = node;
    }, [registerRef, otpInputRef]);

    const handleOnChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.value = e.target.value.replace(/\D/g, "");
        registerOnChange(e);
    }, [registerOnChange]);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {errors.root && <p className="text-xs text-red-500">{errors.root?.message}</p>}
            <p className="text-[12px] text-[#a6a6a6] font-light">
                Enter the 6-digit verification code sent to your email
            </p>
            {/* OTP Field */}
            <div className="space-y-1">
                <Label
                    htmlFor="otp"
                    className="text-[#a6a6a6] text-[12px] font-HelveticaNow font-medium"
                >
                    Verification Code
                </Label>
                <input
                    ref={handleRef}
                    id="otp"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    onChange={handleOnChange}
                    {...rest}
                    className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 font-light placeholder:text-[12px]"
                />
                {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
                {resendMessage ? (
                    <p className="text-xs text-green-500">{resendMessage}</p>
                ) : countdown > 0 ? (
                    <p className="text-[12px] text-[#a6a6a6] font-light">
                        Resend available in {countdown} seconds {resendCount > 0 && `(Resent ${resendCount} ${resendCount === 1 ? 'time' : 'times'})`}
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-[12px] text-[#a6a6a6] hover:text-white underline font-light"
                    >
                        {resendLoading ? "Resending..." : `Didn't receive code? Resend${resendCount > 0 ? ` (${resendCount})` : ''}`}
                    </button>
                )}
            </div>

            {/* Back and Submit Buttons */}
            <div className="flex justify-between items-center">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-transparent hover:bg-[#3c3c3c] text-[#a6a6a6] hover:text-white flex items-center gap-1"
                >
                    <ArrowLeft size={14} /> Back
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-(--custom-primary) hover:bg-(--custom-primary) cursor-pointer text-black"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Continue"}
                </Button>
            </div>
        </form>
    );
}

export default OtpStep;