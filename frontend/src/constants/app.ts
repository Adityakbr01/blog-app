// App Constants
export const APP_NAME = "Dk Blogs";
export const APP_DESCRIPTION = "A modern blog platform to share your thoughts and ideas";

// Auth Page Metadata
export const AUTH_METADATA = {
    signin: {
        title: "Sign In",
        description: "Sign in to your Blog App account",
    },
    signup: {
        title: "Create Account",
        description: "Create a new Blog App account to get started",
    },
    myAccount: {
        title: "My Account",
        description: "Manage your Blog App account settings and profile",
    },
    forgotPassword: {
        title: "Forgot Password",
        description: "Reset your Blog App account password",
    },
    resetPassword: {
        title: "Reset Password",
        description: "Set a new password for your Blog App account",
    },
};

// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Route Constants
export const ROUTES = {
    HOME: "/",
    SIGNIN: "/signin",
    SIGNUP: "/signup/newUser",
    MY_ACCOUNT: "/myAccount",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    BLOGS: "/blog",
    SEARCH: "/search",
};


export type NavLink = {
    href: string;
    value: string;
    bgColor?: string;
    textColor?: string;
    className?: string;
    isProfile?: boolean;
};

export const BASE_LINKS: NavLink[] = [
    { href: "/", value: "Home" },
    {
        href: "/blog",
        value: "Blogs",
        textColor: "#BE524B",
        className: "animate-shake-with-pause",
    },
    { href: "/search", value: "Search" },
];


export const SIGNIN_LINK: NavLink = {
    href: "/signin",
    value: "Sign in",
    bgColor: "#24cfa6",
    textColor: "#000",
};


export const PROFILE_LINK: NavLink = {
    href: "/myAccount",
    value: "Profile",
    isProfile: true,
};
export const ADMIN_LINK: NavLink = {
    href: "/admin",
    value: "Admin",

};