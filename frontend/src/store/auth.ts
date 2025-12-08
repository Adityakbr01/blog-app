// store/auth.ts
import { AuthUser } from "@/types/auth";
import { create } from "zustand";

// Re-export for backward compatibility
export type User = AuthUser;

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

// Import secure local storage
import { secureLocalStorage } from "@/utils/encryption";

// ✅ Safe get from localStorage with encryption
const getUserFromLocalStorage = (): AuthUser | null => {
  if (typeof window !== "undefined") {
    return secureLocalStorage.getItem<AuthUser>("user");
  }
  return null;
};

// Get persisted access token if available
const getPersistedToken = (): string | null => {
  if (typeof window !== "undefined") {
    return secureLocalStorage.getItem<string>("accessToken");
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getPersistedToken(),
  user: getUserFromLocalStorage(),
  setAccessToken: (token) => {
    set({ accessToken: token });
    if (typeof window !== "undefined") {
      if (token) {
        secureLocalStorage.setItem("accessToken", token);
      } else {
        secureLocalStorage.removeItem("accessToken");
      }
    }
  },
  setUser: (user) => {
    set({ user });
    if (typeof window !== "undefined") {
      secureLocalStorage.setItem("user", user);
    }
  },
  clearAuth: () => {
    set({ accessToken: null, user: null });
    if (typeof window !== "undefined") {
      secureLocalStorage.removeItem("user");
      secureLocalStorage.removeItem("accessToken");
    }
  },
}));
