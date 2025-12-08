// store/bookmark.ts
import { Post } from "@/types/post";
import { create } from "zustand";

const BOOKMARKS_KEY = "blog_bookmarks";

export interface BookmarkState {
    bookmarks: Post[];
    isLoaded: boolean;
    loadBookmarks: () => void;
    addBookmark: (post: Post) => void;
    removeBookmark: (postId: string) => void;
    toggleBookmark: (post: Post) => void;
    isBookmarked: (postId: string) => boolean;
    clearBookmarks: () => void;
}

// Get bookmarks from localStorage
const getBookmarksFromStorage = (): Post[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(BOOKMARKS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save bookmarks to localStorage
const saveBookmarksToStorage = (bookmarks: Post[]) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
        console.error("Failed to save bookmarks:", error);
    }
};

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
    bookmarks: [],
    isLoaded: false,

    loadBookmarks: () => {
        const bookmarks = getBookmarksFromStorage();
        set({ bookmarks, isLoaded: true });
    },

    addBookmark: (post: Post) => {
        const { bookmarks } = get();
        if (!bookmarks.find((b) => b._id === post._id)) {
            const newBookmarks = [post, ...bookmarks];
            set({ bookmarks: newBookmarks });
            saveBookmarksToStorage(newBookmarks);
        }
    },

    removeBookmark: (postId: string) => {
        const { bookmarks } = get();
        const newBookmarks = bookmarks.filter((b) => b._id !== postId);
        set({ bookmarks: newBookmarks });
        saveBookmarksToStorage(newBookmarks);
    },

    toggleBookmark: (post: Post) => {
        const { bookmarks, addBookmark, removeBookmark } = get();
        if (bookmarks.find((b) => b._id === post._id)) {
            removeBookmark(post._id);
        } else {
            addBookmark(post);
        }
    },

    isBookmarked: (postId: string) => {
        return get().bookmarks.some((b) => b._id === postId);
    },

    clearBookmarks: () => {
        set({ bookmarks: [] });
        if (typeof window !== "undefined") {
            localStorage.removeItem(BOOKMARKS_KEY);
        }
    },
}));
