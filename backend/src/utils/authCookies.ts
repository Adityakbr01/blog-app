// utils/authCookies.ts
import { Response, Request } from "express";
import { env } from "../config/env.js";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  maxAge?: number;
  path?: string;
}

export interface TokenCookies {
  accessToken?: string;
  refreshToken?: string;
}

// Default cookie config
const isProd = env.NODE_ENV === "production";

const defaultAccessOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15m
  path: "/",
};

const defaultRefreshOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  path: "/",
};

// ---------------------------------------------------------------------
//  SET COOKIE
// ---------------------------------------------------------------------
export const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  const finalOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict", // literal typed
    ...options,
  };

  res.cookie(name, value, finalOptions);
};

// ---------------------------------------------------------------------
//  GET COOKIE
// ---------------------------------------------------------------------
export const getCookie = (req: Request, name: string): string | undefined => {
  return req.cookies?.[name];
};

// ---------------------------------------------------------------------
//  CLEAR COOKIE
// ---------------------------------------------------------------------
export const clearCookie = (res: Response, name: string, options: CookieOptions = {}) => {
  const finalOptions = { path: "/", ...options };
  res.clearCookie(name, finalOptions);
};

// ---------------------------------------------------------------------
//  SET AUTH TOKEN COOKIES (ACCESS + REFRESH)
// ---------------------------------------------------------------------
export const setAuthCookies = (
  res: Response,
  tokens: TokenCookies,
  customAccessOptions: CookieOptions = {},
  customRefreshOptions: CookieOptions = {},
) => {
  if (tokens.accessToken) {
    setCookie(res, "accessToken", tokens.accessToken, {
      ...defaultAccessOptions,
      ...customAccessOptions,
    });
  }

  if (tokens.refreshToken) {
    setCookie(res, "refreshToken", tokens.refreshToken, {
      ...defaultRefreshOptions,
      ...customRefreshOptions,
    });
  }
};

// ---------------------------------------------------------------------
//  GET AUTH TOKENS
// ---------------------------------------------------------------------
export const getAuthCookies = (req: Request): TokenCookies => {
  return {
    accessToken: getCookie(req, "accessToken"),
    refreshToken: getCookie(req, "refreshToken"),
  };
};

// ---------------------------------------------------------------------
//  CLEAR BOTH AUTH COOKIES
// ---------------------------------------------------------------------
export const clearAuthCookies = (res: Response, options: CookieOptions = {}) => {
  clearCookie(res, "accessToken", options);
  clearCookie(res, "refreshToken", options);
};
