import { HTTP_STATUS } from "@/constants/api.constants.js";
import * as AuthService from "@/services/auth.service.js";
import { asyncWrap } from "@/utils/asyncWrap.js";
import { clearAuthCookies, setAuthCookies } from "@/utils/authCookies.js";
import { sendResponse } from "@/utils/sendResponse.js";
import { LoginInput, SignupInput, VerifyOtpInput, ResendOtpInput, ResetPasswordInput } from "@/validations/auth.schema.js";
import { Request, Response } from "express";

// ---- Signup Controller ----
export const signup = asyncWrap(async (req: Request, res: Response) => {
  const data: SignupInput = req.body;

  const result = await AuthService.signup(data);

  return sendResponse(res, HTTP_STATUS.CREATED, result.message, { email: result.email });
});

// ---- Verify OTP Controller ----
export const verifyOtp = asyncWrap(async (req: Request, res: Response) => {
  const data: VerifyOtpInput = req.body;

  const result = await AuthService.verifyOtpAndActivate(data);

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return sendResponse(res, HTTP_STATUS.OK, result.message, {
    user: result.user,
    accessToken: result.accessToken,
  });
});

// ---- Resend OTP Controller ----
export const resendOtp = asyncWrap(async (req: Request, res: Response) => {
  const data: ResendOtpInput = req.body;

  const result = await AuthService.resendOtp(data);

  return sendResponse(res, HTTP_STATUS.OK, result.message, { email: result.email });
});

// ---- Forgot Password Controller ----
export const forgotPassword = asyncWrap(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  return sendResponse(res, HTTP_STATUS.OK, result.message, { email: result.email });
});

// ---- Reset Password Controller ----
export const resetPassword = asyncWrap(async (req: Request, res: Response) => {
  const data: ResetPasswordInput = req.body;

  const result = await AuthService.resetPassword(data);

  return sendResponse(res, HTTP_STATUS.OK, result.message);
});

// ---- Login Controller ----
export const login = asyncWrap(async (req: Request, res: Response) => {
  const data: LoginInput = req.body;

  const result = await AuthService.login(data);

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return sendResponse(res, HTTP_STATUS.OK, "Login successful", {
    user: result?.user,
    accessToken: result?.accessToken,
  });
});

// ---- Logout Controller ----
export const logout = asyncWrap(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const refreshToken = req.cookies?.refreshToken;

  if (userId) {
    await AuthService.logout(userId, refreshToken);
  }

  clearAuthCookies(res);
  return sendResponse(res, HTTP_STATUS.OK, "Logged out successfully");
});

// ---- Refresh Token Controller ----
export const refreshToken = asyncWrap(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Refresh token is required");
  }

  const result = await AuthService.refreshToken(token);

  setAuthCookies(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return sendResponse(res, HTTP_STATUS.OK, "Token refreshed successfully", {
    accessToken: result?.accessToken,
  });
});

// ---- Get Profile Controller ----
export const getProfile = asyncWrap(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      "Authentication required"
    );
  }

  const user = await AuthService.getUserById(req.user.id);

  return sendResponse(
    res,
    HTTP_STATUS.OK,
    "User profile retrieved successfully",
    user
  );
});
