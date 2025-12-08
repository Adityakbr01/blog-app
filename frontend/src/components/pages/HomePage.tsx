"use client";

import { useGetPosts } from "@/hooks/TanStack/mutations";
import BlogGrid from "@/components/common/BlogGrid";
import CreateBlogDrawer from "@/components/common/CreateBlogDrawer";
import { Button } from "@/components/ui/button";
import { APP_NAME, BASE_LINKS } from "@/constants/app";
import { Search, PenLine, ArrowRight } from "lucide-react";
import Link from "next/link";

function HomePage() {
    const { data, isLoading } = useGetPosts({
        limit: 6,
        published: "true",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    const posts = data?.data?.posts || [];

    return (
        <div className="w-full min-h-screen">
            {/* Hero Section */}
            <section className="relative font-NeuMachina flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        Welcome to{" "}
                        <span className="text-primary">{APP_NAME}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Discover insightful articles, share your thoughts, and connect with a community of passionate writers and readers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href={BASE_LINKS[1].href}>
                                <Search className="h-4 w-4 mr-2" />
                                Explore Blogs
                            </Link>
                        </Button>
                        <CreateBlogDrawer
                            trigger={
                                <Button size="lg" variant="outline">
                                    <PenLine className="h-4 w-4 mr-2" />
                                    Start Writing
                                </Button>
                            }
                        />
                    </div>
                </div>
                <div
                    className="fixed top-0 left-0 w-full h-80 pointer-events-none z-0 overflow-hidden"
                    style={{
                        background: `linear-gradient(to right, rgba(255, 99, 8, 0.13), rgba(189, 201, 230, 0.13), rgba(151, 196, 255, 0.1))`,
                        maskImage: `radial-gradient(ellipse at top, black, transparent 70%)`,
                        WebkitMaskImage: `radial-gradient(ellipse at top, black, transparent 70%)`,
                    }}
                    aria-hidden="true"
                ></div>
            </section>

            {/* Latest Posts Section */}
            <section className="px-4 md:px-8 lg:px-16 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Latest Posts</h2>
                            <p className="text-muted-foreground mt-1">
                                Fresh content from our community
                            </p>
                        </div>
                        <Button variant="outline" className="border-none" asChild>
                            <Link href="/blogs" className="group">
                                View All
                                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    <BlogGrid posts={posts} isLoading={isLoading} />
                </div>
            </section>
        </div>
    );
}

export default HomePage;
