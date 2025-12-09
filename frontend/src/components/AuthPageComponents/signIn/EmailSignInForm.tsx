"use client"
import React, { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useLogin } from "@/hooks/TanStack/mutations/auth"
import { useRouter } from "next/navigation"
import { secureLocalStorage } from "@/utils/encryption"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "@/validations/auth.schema"
import Link from "next/link"

function EmailSignInForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)

  const loginMutation = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for saved credentials on mount
  useEffect(() => {
    const savedCredentials = secureLocalStorage.getItem<{ email: string; password: string }>("rememberedCredentials");
    if (savedCredentials) {
      setValue("email", savedCredentials.email);
      setValue("password", savedCredentials.password);
      // Use a microtask to avoid the cascading render warning
      queueMicrotask(() => setRememberMe(true));
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        secureLocalStorage.setItem("rememberedCredentials", { email: data.email, password: data.password });
      } else {
        secureLocalStorage.removeItem("rememberedCredentials");
      }

      await loginMutation.mutateAsync(data);
      router.push("/");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.response?.data?.message || "Login failed";
      setError("root", { message: errorMessage });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {errors.root && (
        <p className="text-xs text-red-500 text-center">{errors.root.message}</p>
      )}

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
          {...register("email")}
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
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          className="border-b py-[0.30rem] w-full rounded-sm border-[#3c3c3c] outline-none bg-[#1e1e1e] px-4 pr-10 font-light placeholder:text-[12px]"
        />
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-[65%] transform cursor-pointer -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            className="data-[state=checked]:bg-(--custom-primary) data-[state=checked]:border-(--custom-primary) border-[#3c3c3c] text-black focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-(--custom-primary) h-4 w-4 rounded-sm cursor-pointer"
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label
            htmlFor="remember-me"
            className="text-[12px] text-[#a6a6a6] font-HelveticaNow font-medium cursor-pointer"
          >
            Remember me
          </label>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="ghost"
          disabled={isSubmitting || loginMutation.isPending}
          className="text-[12px] px-3 py-1 h-fit w-fit rounded-full border border-[#3c3c3c] bg-(--custom-primary) hover:bg-(--custom-primary) cursor-pointer text-black"
        >
          {(isSubmitting || loginMutation.isPending) ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign In"}
        </Button>
      </div>

      {/* Sign Up Link */}
      <p className="text-[12px] text-[#a6a6a6] text-center mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup/newUser" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  )
}

export default EmailSignInForm
