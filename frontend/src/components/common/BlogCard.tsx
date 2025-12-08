"use client";

import { useEffect } from "react";
import { Post } from "@/types/post";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useBookmarkStore } from "@/store/bookmark";
import toast from "react-hot-toast";

interface BlogCardProps {
    post: Post;
}

export default function BlogCard({ post }: BlogCardProps) {
    const { isBookmarked, toggleBookmark, loadBookmarks, isLoaded } = useBookmarkStore();
    const bookmarked = isBookmarked(post._id);

    // Load bookmarks on mount
    useEffect(() => {
        if (!isLoaded) {
            loadBookmarks();
        }
    }, [isLoaded, loadBookmarks]);

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(post);
        toast.success(bookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getAuthorInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    return (
        <Link href={`/blog/${post.slug}`}>
            <Card className="group font-HelveticaNow p-0 pb-2 h-full overflow-hidden transition-all duration-300 cursor-pointer border-border/50">
                {/* Image */}
                {post.image && (
                    <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.category && (
                            <Badge
                                className="absolute font-NeuMachina top-3 left-3 text-xs"
                                style={{ backgroundColor: post.category.color || undefined, color: '#fff' }}
                            >
                                {post.category.name}
                            </Badge>
                        )}
                        {/* Bookmark Button */}
                        <button
                            onClick={handleBookmark}
                            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${bookmarked
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-black/50 text-white hover:bg-black/70"
                                }`}
                        >
                            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                        </button>
                    </div>
                )}

                <CardHeader className="pb-2">
                    {/* Category badge if no image */}
                    {!post.image && post.category && (
                        <Badge
                            className="w-fit text-xs text-white mb-2"
                            style={{ backgroundColor: post.category.color || undefined, color: '#fff' }}
                        >
                            {post.category.name}
                        </Badge>
                    )}
                    <h3 className="text-lg font-NeuMachina font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </CardHeader>

                <CardContent className="pt-0 pb-3  text-white">
                    <p className="text-shadow-muted-foreground text-sm line-clamp-2">
                        {post.description}
                    </p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs text-[#e4e8ee] bg-[#882727]">
                                    #{tag}
                                </Badge>
                            ))}
                            {post.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{post.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 mt-auto">
                    {/* Author */}
                    <Link
                        href={`/user/${post.author.username || post.author._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 pt-3 hover:opacity-80 transition-opacity"
                    >
                        <Avatar className="h-7 w-7">
                            <AvatarImage src={post.author.avatar} alt={post.author.name} className="rounded-full object-cover" />
                            <AvatarFallback className="text-xs">
                                {getAuthorInitials(post.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {post.author.name}
                        </span>
                    </Link>

                    {/* Stats */}
                    <div className="flex items-center text-[#fff] gap-3 pt-3">
                        <div className="flex items-center gap-1 text-xs">
                            <Heart className="h-3.5 w-3.5" />
                            <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1  text-xs">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{post.commentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
