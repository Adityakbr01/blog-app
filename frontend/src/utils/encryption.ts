// Simple secure storage wrapper
// For production, consider using a more secure encryption library

const STORAGE_PREFIX = "blog_app_";

export const secureLocalStorage = {
    setItem: <T>(key: string, value: T): void => {
        if (typeof window === "undefined") return;
        try {
            const serializedValue = JSON.stringify(value);
            // In production, you might want to encrypt this value
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    },

    getItem: <T>(key: string): T | null => {
        if (typeof window === "undefined") return null;
        try {
            const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
            if (!item) return null;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error("Error reading from localStorage:", error);
            return null;
        }
    },

    removeItem: (key: string): void => {
        if (typeof window === "undefined") return;
        try {
            localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
        } catch (error) {
            console.error("Error removing from localStorage:", error);
        }
    },

    clear: (): void => {
        if (typeof window === "undefined") return;
        try {
            // Only clear items with our prefix
            Object.keys(localStorage)
                .filter((key) => key.startsWith(STORAGE_PREFIX))
                .forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    },
};
