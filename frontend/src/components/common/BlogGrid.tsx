"use client";

import { Post } from "@/types/post";
import BlogCard from "./BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

interface BlogGridProps {
    posts: Post[];
    isLoading?: boolean;
}

export function BlogGridSkeleton() {
    return (
        <>
            {/* Mobile Skeleton */}
            <div className="flex gap-4 overflow-hidden md:hidden">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[85%] flex flex-col gap-4">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Desktop Skeleton */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default function BlogGrid({ posts, isLoading }: BlogGridProps) {
    if (isLoading) {
        return <BlogGridSkeleton />;
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-xl text-muted-foreground">No posts found</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Check back later for new content!
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Swiper */}
            <div className="md:hidden -mx-4 px-4">
                <Swiper
                    modules={[FreeMode]}
                    spaceBetween={10}
                    slidesPerView={1.05}
                    freeMode={false}
                >
                    {posts.map((post) => (
                        <SwiperSlide key={post._id}>
                            <BlogCard post={post} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <BlogCard key={post._id} post={post} />
                ))}
            </div>
        </>
    );
}
