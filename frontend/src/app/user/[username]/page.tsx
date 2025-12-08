"use client";

import { useGetPublicProfile, useGetPosts } from "@/hooks/TanStack/mutations";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import BlogCard from "@/components/common/BlogCard";
import {
    ArrowLeft,
    Calendar,
    User,
    FileText,
    Heart,
    MessageCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

function ProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-24 mb-6" />
            <div className="flex flex-col md:flex-row gap-8 mb-12">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-16 w-full max-w-md" />
                    <div className="flex gap-4">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full" />
                ))}
            </div>
        </div>
    );
}

function BlogCardSkeleton() {
    return (
        <div className="space-y-2 bg-[var(--custom-inputColor)] rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full animate-pulse bg-[var(--custom-inputColor)]" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4 animate-pulse bg-muted" />
                <Skeleton className="h-4 w-1/2 animate-pulse bg-muted" />
                <Skeleton className="h-6 w-full animate-pulse bg-muted" />
            </div>
        </div>
    );
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const currentUser = useAuthStore((state) => state.user);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 6;

    // Fetch user profile
    const { data: profileData, isLoading: profileLoading, error: profileError } = useGetPublicProfile(username);
    const profile = profileData?.data;

    // Fetch user's posts
    const { data: postsData, isLoading: postsLoading } = useGetPosts({
        author: profile?._id,
        published: "true",
        limit,
        page: currentPage,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const posts = postsData?.data?.posts || [];
    const pagination = postsData?.data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    const isOwnProfile = currentUser?.id === profile?._id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const getInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    // Calculate total stats
    const totalLikes = posts.reduce((acc, post) => acc + post.likesCount, 0);
    const totalComments = posts.reduce((acc, post) => acc + post.commentsCount, 0);

    // Generate pagination items
    const getPaginationItems = () => {
        const items: (number | "ellipsis")[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(i);
            }
        } else {
            items.push(1);

            if (currentPage > 3) {
                items.push("ellipsis");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!items.includes(i)) {
                    items.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                items.push("ellipsis");
            }

            if (!items.includes(totalPages)) {
                items.push(totalPages);
            }
        }

        return items;
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (profileLoading) {
        return <ProfileSkeleton />;
    }

    if (profileError || !profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-4">User not found</h1>
                <p className="text-muted-foreground mb-6">
                    The user you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 font-NeuMachina">
            {/* Back Button */}
            <Button
                variant="outline"
                size="sm"
                className="mb-6 cursor-pointer group border-none"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                Back
            </Button>

            {/* Profile Header */}
            <Card className="p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Avatar */}
                    <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-primary/20">
                        <AvatarImage
                            src={profile.avatar}
                            alt={profile.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-2xl md:text-3xl font-bold">
                            {getInitials(profile.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                                <p className="text-muted-foreground">@{profile.username}</p>
                            </div>
                            {isOwnProfile && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/myAccount")}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Joined {formatDate(profile.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{pagination?.total || 0} posts</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Heart className="h-4 w-4" />
                                <span>{totalLikes} likes</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span>{totalComments} comments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Posts Section */}
            <div>
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Posts by {profile.name}
                </h2>

                {postsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <Card className="p-8 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {isOwnProfile
                                ? "You haven't published any posts yet."
                                : `${profile.name} hasn't published any posts yet.`}
                        </p>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {posts.map((post) => (
                                <BlogCard key={post._id} post={post} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination className="mt-8">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {getPaginationItems().map((item, idx) =>
                                        item === "ellipsis" ? (
                                            <PaginationItem key={`ellipsis-${idx}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={item}>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(item)}
                                                    isActive={currentPage === item}
                                                    className="cursor-pointer"
                                                >
                                                    {item}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
