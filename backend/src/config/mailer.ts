import nodemailer from "nodemailer";
import { env } from "@/config/env.js";
import logger from "@/utils/logger.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const sendMail = async (options: MailOptions): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: env.SMTP_FROM,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        logger.info(`Email sent to ${options.to}`);
        return true;
    } catch (error) {
        logger.error("Email sending error:", error);
        return false;
    }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
      <p>This OTP is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

    return sendMail({
        to: email,
        subject: "Verify Your Email - Blog App",
        html,
    });
};

export const sendPasswordResetEmail = async (email: string, otp: string): Promise<boolean> => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You have requested to reset your password. Use the following OTP to proceed:</p>
      <h1 style="color: #FF5722; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
      <p>This OTP is valid for ${env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

    return sendMail({
        to: email,
        subject: "Password Reset - Blog App",
        html,
    });
};

export default transporter;
