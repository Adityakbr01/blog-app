"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import { useAuthStore } from "@/store/auth";
import {
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
} from "@/hooks/TanStack/mutations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    Reply,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    Send,
    X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
    comment: Comment;
    postId: string;
    depth?: number;
    maxDepth?: number;
}

export default function CommentItem({
    comment,
    postId,
    depth = 0,
    maxDepth = 5,
}: CommentItemProps) {
    const user = useAuthStore((state) => state.user);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(true);

    const createCommentMutation = useCreateComment(postId);
    const updateCommentMutation = useUpdateComment();
    const deleteCommentMutation = useDeleteComment();

    const isAuthor = user?.id === comment.author._id;
    const canReply = depth < maxDepth && user;

    const getAuthorInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;

        await createCommentMutation.mutateAsync({
            content: replyContent,
            parentId: comment._id,
        });

        setReplyContent("");
        setIsReplying(false);
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        await updateCommentMutation.mutateAsync({
            id: comment._id,
            data: { content: editContent },
        });

        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this comment?")) {
            await deleteCommentMutation.mutateAsync(comment._id);
        }
    };

    if (comment.isDeleted) {
        return (
            <div className={`${depth > 0 ? "ml-6 md:ml-10 border-l-2 border-border pl-4" : ""}`}>
                <p className="text-muted-foreground italic text-sm py-2">
                    [This comment has been deleted]
                </p>
                {comment.replies.length > 0 && (
                    <div className="mt-2 space-y-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                postId={postId}
                                depth={depth + 1}
                                maxDepth={maxDepth}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`${depth > 0 ? "ml-6 md:ml-10 border-l-2 border-border pl-4" : ""}`}>
            <div className="py-3">
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={comment.author.avatar}
                                alt={comment.author.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xs">
                                {getAuthorInitials(comment.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), {
                                    addSuffix: true,
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    {(isAuthor || canReply) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canReply && (
                                    <DropdownMenuItem onClick={() => setIsReplying(true)}>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                    </DropdownMenuItem>
                                )}
                                {isAuthor && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleDelete}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Comment Content */}
                {isEditing ? (
                    <div className="mt-3 space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-20 resize-none"
                            placeholder="Edit your comment..."
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleEdit}
                                disabled={updateCommentMutation.isPending}
                            >
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                )}

                {/* Quick Reply Button */}
                {canReply && !isReplying && !isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground h-7 px-2"
                        onClick={() => setIsReplying(true)}
                    >
                        <Reply className="h-3.5 w-3.5 mr-1" />
                        Reply
                    </Button>
                )}

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={user?.avatar} alt={user?.name} />
                                <AvatarFallback className="text-xs">
                                    {user?.name ? getAuthorInitials(user.name) : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-[60px] resize-none"
                                    placeholder={`Reply to ${comment.author.name}...`}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setIsReplying(false);
                                    setReplyContent("");
                                }}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleReply}
                                disabled={createCommentMutation.isPending || !replyContent.trim()}
                            >
                                <Send className="h-4 w-4 mr-1" />
                                Reply
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
                <div className="mt-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-7 px-2 mb-2"
                        onClick={() => setShowReplies(!showReplies)}
                    >
                        {showReplies ? (
                            <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide {comment.replies.length} repl
                                {comment.replies.length === 1 ? "y" : "ies"}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Show {comment.replies.length} repl
                                {comment.replies.length === 1 ? "y" : "ies"}
                            </>
                        )}
                    </Button>

                    {showReplies && (
                        <div className="space-y-1">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply._id}
                                    comment={reply}
                                    postId={postId}
                                    depth={depth + 1}
                                    maxDepth={maxDepth}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
