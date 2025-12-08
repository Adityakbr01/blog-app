import { env } from "@/config/env.js";
import { HTTP_STATUS } from "@/constants/api.constants.js";
import { JwtPayload } from "@/types/express.js";
import AppError from "@/utils/AppError.js";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

// ---- Verify Token (for middleware) ----
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token has expired", HTTP_STATUS.UNAUTHORIZED);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", HTTP_STATUS.UNAUTHORIZED);
    }
    throw error;
  }
};

// ---- Password Hashing (bcrypt) ----
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.SALT_ROUNDS);
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  return bcrypt.compare(password, storedHash);
};

// ---- JWT Token Generation ----
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY } as SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY } as SignOptions);
};

// ---- OTP Generation and Verification ----
export const generateOtp = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
};

export const hashOtp = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, 10);
};

export const verifyOtp = async (otp: string, hashedOtp: string): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};
