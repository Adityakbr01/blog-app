"use client";

import { useEffect } from "react";
import { useBookmarkStore } from "@/store/bookmark";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/common/BlogCard";
import { Bookmark, Trash2 } from "lucide-react";

export default function BookmarksTab() {
    const { bookmarks, loadBookmarks, isLoaded, clearBookmarks } = useBookmarkStore();

    // Load bookmarks on mount
    useEffect(() => {
        if (!isLoaded) {
            loadBookmarks();
        }
    }, [isLoaded, loadBookmarks]);

    const handleClearAll = () => {
        if (confirm("Are you sure you want to clear all bookmarks?")) {
            clearBookmarks();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    My Bookmarks ({bookmarks.length})
                </h2>
                {bookmarks.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            {bookmarks.length === 0 ? (
                <Card className="p-8 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                        No bookmarks yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Save posts you want to read later by clicking the bookmark icon
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks.map((post) => (
                        <BlogCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
