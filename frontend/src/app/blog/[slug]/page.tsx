"use client";

import { useEffect } from "react";
import { useGetPost, useToggleLike } from "@/hooks/TanStack/mutations";
import { useAuthStore } from "@/store/auth";
import { useBookmarkStore } from "@/store/bookmark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommentsSection from "@/components/common/CommentsSection";
import {
    Heart,
    MessageCircle,
    Calendar,
    Clock,
    ArrowLeft,
    Share2,
    Bookmark,
    Pencil,
    FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import EditBlogDrawer from "@/components/common/EditBlogDrawer";

function BlogDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-24 mb-6" />
            <Skeleton className="w-full aspect-video rounded-xl mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    );
}

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { data, isLoading, error } = useGetPost(slug);
    const user = useAuthStore((state) => state.user);
    const toggleLikeMutation = useToggleLike(user?.id);

    // Bookmark store
    const { isBookmarked, toggleBookmark, loadBookmarks, isLoaded } = useBookmarkStore();

    // Load bookmarks on mount
    useEffect(() => {
        if (!isLoaded) {
            loadBookmarks();
        }
    }, [isLoaded, loadBookmarks]);

    const post = data?.data;

    // Check if current user is the author
    const isAuthor = user?.id === post?.author._id;

    // Check if post is bookmarked
    const bookmarked = post ? isBookmarked(post._id) : false;

    const handleBookmark = () => {
        if (post) {
            toggleBookmark(post);
            toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return `${minutes} min read`;
    };

    const getAuthorInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const handleLike = () => {
        if (!user) {
            router.push("/signin");
            return;
        }
        toggleLikeMutation.mutate(post!._id);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    text: post?.description,
                    url: window.location.href,
                });
            } catch {
                // Share cancelled
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const isLiked = post?.likes?.some((like) => {
        if (typeof like === "string") return like === user?.id;
        if (typeof like === "object" && like !== null) {
            return (like as { _id?: string })._id === user?.id;
        }
        return false;
    });

    if (isLoading) {
        return <BlogDetailSkeleton />;
    }

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Post not found</h1>
                <p className="text-muted-foreground mb-6">
                    The post you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <article className="max-w-4xl mx-auto px-4 py-8 font-NeuMachina">
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

            {/* Featured Image */}
            {post.image && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {post.category && (
                        <Badge
                            className="text-sm absolute top-5 left-5"
                            style={{
                                backgroundColor: post.category.color || undefined,
                                color: "#fff",
                            }}
                        >
                            {post.category.name}
                        </Badge>
                    )}
                </div>
            )}

            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">

                {post.tags.map((tag) => (
                    <Badge key={tag} variant="default" className="text-sm">
                        #{tag}
                    </Badge>
                ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                {post.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>

            {/* Author & Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-border">
                <Link
                    href={`/user/${post.author.username || post.author._id}`}
                    className="flex items-center gap-3 group"
                >
                    <Avatar className="h-12 w-12 ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                        <AvatarImage
                            src={post.author.avatar}
                            alt={post.author.name}
                            height={30}
                            width={30}
                            className="object-cover rounded-full"
                        />
                        <AvatarFallback className="text-sm font-medium">
                            {getAuthorInitials(post.author.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{post.author.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {getReadingTime(post.content)}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={handleLike}
                        disabled={toggleLikeMutation.isPending}
                    >
                        <Heart
                            className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
                        />
                        {post.likesCount}
                    </Button>
                    <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.commentsCount}
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={bookmarked ? "default" : "outline"}
                        size="icon"
                        onClick={handleBookmark}
                    >
                        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                    </Button>
                    {isAuthor && (
                        <EditBlogDrawer
                            post={post}
                            trigger={
                                <Button variant="outline" size="icon">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>

            {/* Content and Comments Tabs */}
            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent ">
                    <TabsTrigger value="content" className="flex items-center gap-2 cursor-pointer">
                        <FileText className="h-4 w-4" />
                        Content
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="flex items-center gap-2 cursor-pointer">
                        <MessageCircle className="h-4 w-4" />
                        Comments ({post.commentsCount})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-0">
                    {/* Content */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isLiked ? "default" : "outline"}
                                onClick={handleLike}
                                disabled={toggleLikeMutation.isPending}
                            >
                                <Heart
                                    className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                                />
                                {isLiked ? "Liked" : "Like"} ({post.likesCount})
                            </Button>
                            <Button variant="outline" onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                            {isAuthor && (
                                <EditBlogDrawer
                                    post={post}
                                    trigger={
                                        <Button variant="outline">
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="comments" className="mt-0">
                    {/* Comments Section */}
                    <CommentsSection postId={post._id} commentsCount={post.commentsCount} />
                </TabsContent>
            </Tabs>
        </article>
    );
}
