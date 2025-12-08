"use client";

import { useGetMyPosts, useDeletePost, useTogglePublish } from "@/hooks/TanStack/mutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Heart,
    MessageCircle,
    Eye,
    EyeOff,
    MoreVertical,
    Pencil,
    Trash2,
    ExternalLink,
    Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types/post";
import CreateBlogDrawer from "@/components/common/CreateBlogDrawer";
import EditBlogDrawer from "@/components/common/EditBlogDrawer";

function PostCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                <Skeleton className="w-full sm:w-48 h-32" />
                <div className="flex-1 p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-3">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                </div>
            </div>
        </Card>
    );
}

interface PostCardProps {
    post: Post;
    onDelete: (id: string) => void;
    onTogglePublish: (id: string) => void;
    isDeleting: boolean;
    isToggling: boolean;
}

function PostCard({ post, onDelete, onTogglePublish, isDeleting, isToggling }: PostCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    console.log(post)

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                {post.image && (
                    <div className="relative w-full sm:w-48 h-32 flex-shrink-0">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant={post.isPublished ? "default" : "secondary"}>
                                    {post.isPublished ? (
                                        <>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Published
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Draft
                                        </>
                                    )}
                                </Badge>
                                {post.category && (
                                    <Badge variant="outline">{post.category.name}</Badge>
                                )}
                            </div>
                            <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {post.description}
                            </p>
                        </div>

                        {/* Edit Button & Actions Dropdown */}
                        <div className="flex items-center gap-1">
                            <EditBlogDrawer
                                post={post}
                                trigger={
                                    <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/blog/${post.slug}`}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Post
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onTogglePublish(post._id)}
                                        disabled={isToggling}
                                    >
                                        {post.isPublished ? (
                                            <>
                                                <EyeOff className="h-4 w-4 mr-2" />
                                                Unpublish
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Publish
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(post._id)}
                                        disabled={isDeleting}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentsCount}</span>
                        </div>
                        <span className="text-xs">{formatDate(post.createdAt)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default function MyPostsTab() {
    const { data, isLoading } = useGetMyPosts();
    const deleteMutation = useDeletePost();
    const togglePublishMutation = useTogglePublish();

    const posts = data?.data || [];

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleTogglePublish = (id: string) => {
        togglePublishMutation.mutate(id);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">My Posts</h2>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Posts ({posts.length})</h2>
                <CreateBlogDrawer
                    trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Post
                        </Button>
                    }
                />
            </div>

            {posts.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                        You haven&apos;t written any posts yet.
                    </p>
                    <CreateBlogDrawer
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Write Your First Post
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handleDelete}
                            onTogglePublish={handleTogglePublish}
                            isDeleting={deleteMutation.isPending}
                            isToggling={togglePublishMutation.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
