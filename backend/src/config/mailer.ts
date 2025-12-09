// src/utils/email.ts
import { env } from "@/config/env.js";
import logger from "@/utils/logger.js";
import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "waldo53@ethereal.email",
    pass: "689QECkV17reprapUD",   // ← yeh tumhara real password hai
  },
  tls: { rejectUnauthorized: false },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: '"Aditya Blog App" <no-reply@blogapp.com>',
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);  // ← YE MAGIC LINE HAI
    logger.info(`OTP Email sent to ${to}`);
    logger.info(`Preview URL → ${previewUrl}`);   // ← YAHAN CLICK KARKE OTP DIKHEGA

    return true;
  } catch (error: any) {
    logger.error("Email failed:", error.message);
    return false;
  }
};
// OTP Email
export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background: #f9f9f9; border-radius: 12px; text-align: center;">
      <h2 style="color: #1a1a1a;">Verify Your Email Address</h2>
      <p style="color: #555; font-size: 16px;">Here is your verification code:</p>
      <div style="margin: 40px 0;">
        <h1 style="background: #4CAF50; color: white; font-size: 36px; letter-spacing: 12px; padding: 18px 24px; border-radius: 10px; display: inline-block;">
          ${otp}
        </h1>
      </div>
      <p style="color: #555;">This code expires in <strong>${env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
      <p style="color: #999; font-size: 13px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: "Your Verification Code - Aditya Blog App",
    html,
  });
};

// Password Reset Email
export const sendPasswordResetEmail = async (email: string, otp: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px; background: #fff8f0; border-radius: 12px; text-align: center;">
      <h2 style="color: #1a1a1a;">Password Reset Request</h2>
      <p style="color: #555; font-size: 16px;">Use the code below to reset your password:</p>
      <div style="margin: 40px 0;">
        <h1 style="background: #FF5722; color: white; font-size: 36px; letter-spacing: 12px; padding: 18px 24px; border-radius: 10px; display: inline-block;">
          ${otp}
        </h1>
      </div>
      <p style="color: #555;">Valid for <strong>${env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
      <p style="color: #999; font-size: 13px; margin-top: 30px;">Not you? Just ignore this email.</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: "Reset Your Password - Aditya Blog App",
    html,
  });
};