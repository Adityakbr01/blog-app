"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useGetComments, useCreateComment } from "@/hooks/TanStack/mutations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send } from "lucide-react";
import CommentItem from "./CommentItem";
import Link from "next/link";

interface CommentsSectionProps {
    postId: string;
    commentsCount: number;
}

function CommentsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CommentsSection({ postId, commentsCount }: CommentsSectionProps) {
    const user = useAuthStore((state) => state.user);
    const [newComment, setNewComment] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetComments(postId, { page, limit: 20 });
    const createCommentMutation = useCreateComment(postId);

    const comments = data?.data?.comments || [];
    const pagination = data?.data?.pagination;

    const getAuthorInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        await createCommentMutation.mutateAsync({
            content: newComment,
        });

        setNewComment("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.metaKey) {
            handleSubmit();
        }
    };

    return (
        <section className="mt-12 pt-8 border-t border-border">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="h-5 w-5" />
                <h2 className="text-xl font-semibold">
                    Comments ({commentsCount})
                </h2>
            </div>

            {/* New Comment Form */}
            {user ? (
                <div className="mb-8">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                                {getAuthorInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Write a comment... (⌘ + Enter to submit)"
                                className="min-h-[100px]"
                            />
                            <div className="flex justify-end mt-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={createCommentMutation.isPending || !newComment.trim()}
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-muted-foreground mb-2">
                        Sign in to join the conversation
                    </p>
                    <Button asChild>
                        <Link href="/signin">Sign In</Link>
                    </Button>
                </div>
            )}

            {/* Comments List */}
            {isLoading ? (
                <CommentsSkeleton />
            ) : comments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        No comments yet. Be the first to comment!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            postId={postId}
                        />
                    ))}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-3 text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
