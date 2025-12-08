"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FieldErrors, UseFormReturn } from "react-hook-form";
import { PersonalFormData } from "./EmailSignUpForm";


// Personal Step Component
interface PersonalStepProps {
    form: UseFormReturn<PersonalFormData>;
    loading: boolean;
    onBack: () => void;
    errors: FieldErrors<PersonalFormData>;
    onSubmit: (data: PersonalFormData) => Promise<void>;
}

function PersonalStep({ form, loading, onBack, errors, onSubmit }: PersonalStepProps) {
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {errors.root && <p className="text-xs text-red-500">{errors.root?.message}</p>}
            <p className="text-[12px] text-[#a6a6a6] font-light">
                Tell us a bit about yourself
            </p>
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

            {/* Phone Field */}
            <div className="space-y-1">
                <Label
                    htmlFor="phone"
                    className="text-[#a6a6a6] text-[12px] font-HelveticaNow font-medium"
                >
                    Phone Number
                </Label>
                <input
                    id="phone"
                    placeholder="Enter your phone number"
                    type="tel"
                    {...form.register("phone")}
                    className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 font-light placeholder:text-[12px]"
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
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
                    className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-[var(--custom-primary)] hover:bg-[var(--custom-primary)] cursor-pointer text-black"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Complete"}
                </Button>
            </div>
        </form>
    );
}

export default PersonalStep;