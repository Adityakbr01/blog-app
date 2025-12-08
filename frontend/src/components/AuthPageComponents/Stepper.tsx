"use client"
import React from "react"

interface StepperProps {
    steps: string[]
    currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="flex items-center justify-between w-full mb-6">
            {steps.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                    <div key={index} className="flex-1 flex items-center">
                        {/* Step Circle */}
                        <div
                            className={`w-2 h-2 flex items-center justify-center rounded-full text-sm font-medium
                ${isCompleted ? "bg-[var(--custom-primary)] text-black" : isActive ? "border-2 border-[var(--custom-primary)] text-white" : "bg-[#2c2c2c] text-gray-400"}
              `}
                        >

                        </div>

                        {/* Line Between Steps */}
                        {index < steps.length - 1 && (
                            <div
                                className={`flex-1 h-[2px] mx-2 ${isCompleted ? "bg-[var(--custom-primary)]" : "bg-[#3c3c3c]"
                                    }`}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
