"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogout } from "@/hooks/TanStack/mutations/auth";
import { useUpdateAvatar, useDeleteAvatar, useChangePassword } from "@/hooks/TanStack/mutations/user";
import { User } from "@/store/auth";
import { LogOut, Pencil, Trash2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordFormData } from "@/validations/user.schema";
import { AxiosError } from "axios";


interface PersonalTabProps {
    user: User;
    setUser: (user: User) => void;
    logoutMutation: ReturnType<typeof useLogout>;// adjust generic types if needed
}

function PersonalTab({ user, setUser, logoutMutation }: PersonalTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const updateAvatarMutation = useUpdateAvatar();
    const deleteAvatarMutation = useDeleteAvatar();
    const changePasswordMutation = useChangePassword();

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return;
            }
            updateAvatarMutation.mutate(file);
        }
        // Reset input so same file can be selected again
        e.target.value = "";
    };

    const handleDeleteAvatar = () => {
        if (user?.avatar) {
            deleteAvatarMutation.mutate();
        }
    };

    const onPasswordSubmit = async (data: ChangePasswordFormData) => {
        changePasswordMutation.mutate(data, {
            onSuccess: () => {
                reset();
                setShowPasswordForm(false);
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
            onError: (error: unknown) => {
                if (error instanceof AxiosError) {
                    const message = error?.response?.data?.message || "Failed to change password";
                    setError("root", { message });
                }
            },
        });
    };

    console.log("Rendering PersonalTab with user:", user);

    return (
        <div className="space-y-8">
            {/* Profile Image */}
            <div className="flex sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-gray-700">
                    <Image
                        src={user?.avatar || "https://cdn-icons-png.flaticon.com/128/1326/1326390.png"}
                        alt={`${user.name} profile`}
                        fill
                        className="object-cover"
                    />
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {/* Edit button */}
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleAvatarClick}
                        disabled={updateAvatarMutation.isPending}
                        className="absolute w-8 h-8 bottom-1 right-1 bg-(--custom-primary) z-20 rounded-full hover:opacity-90"
                    >
                        {updateAvatarMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Pencil size={14} />
                        )}
                    </Button>
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-semibold">{user.name}</h2>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {/* Delete avatar button */}
                    {user?.avatar && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDeleteAvatar}
                            disabled={deleteAvatarMutation.isPending}
                            className="mt-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs px-2 py-1 h-auto"
                        >
                            {deleteAvatarMutation.isPending ? (
                                <Loader2 size={12} className="animate-spin mr-1" />
                            ) : (
                                <Trash2 size={12} className="mr-1" />
                            )}
                            Remove Avatar
                        </Button>
                    )}
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        disabled
                        value={user.email}
                        className="mt-1 cursor-not-allowed text-gray-400"
                    />
                </div>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="text-gray-400" />
                        <h3 className="text-lg font-medium">Change Password</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setShowPasswordForm(!showPasswordForm);
                            if (showPasswordForm) {
                                reset();
                            }
                        }}
                        className="text-sm text-blue-500 hover:text-blue-400"
                    >
                        {showPasswordForm ? "Cancel" : "Change"}
                    </Button>
                </div>

                {showPasswordForm && (
                    <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                        {errors.root && (
                            <p className="text-xs text-red-500">{errors.root.message}</p>
                        )}

                        {/* Current Password */}
                        <div className="space-y-1 relative">
                            <Label htmlFor="currentPassword" className="text-sm text-gray-400">
                                Current Password
                            </Label>
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                {...register("currentPassword")}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-white"
                            >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.currentPassword && (
                                <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-1 relative">
                            <Label htmlFor="newPassword" className="text-sm text-gray-400">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password (min 8 characters)"
                                {...register("newPassword")}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-white"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.newPassword && (
                                <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1 relative">
                            <Label htmlFor="confirmPassword" className="text-sm text-gray-400">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-white"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                className="bg-(--custom-primary) hover:bg-(--custom-primary)/90 text-black"
                            >
                                {changePasswordMutation.isPending ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Logout */}
            <div className="pt-4 flex justify-center sm:justify-end">
                <Button onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending} asChild variant="destructive" className="w-full sm:w-auto">
                    <Link href="/signin" className="flex items-center gap-2">
                        <span>Logout</span> <LogOut size={16} />
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default PersonalTab