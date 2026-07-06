/**
 * OTP Email Service — Sends OTP codes via email using Nodemailer.
 *
 * CUSTOMIZATION:
 * - Update the HTML template below to match your app's branding
 * - Update the MAIL_FROM env variable for your app name
 *
 * REQUIRED ENV VARS:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
 */
const nodemailer = require("nodemailer");

/**
 * Create a Nodemailer transporter.
 * Falls back to a JSON transport (console logging) if SMTP_HOST is not set,
 * which is useful for development/testing.
 */
const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
};

/**
 * Send an OTP code to the user's email.
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - The plaintext OTP code
 * @param {number} params.expiresInMinutes - OTP validity period
 * @param {string} [params.appName] - Your application name (default: "Your App")
 * @returns {Object} Nodemailer send result
 */
const sendOtpEmail = async ({ to, otp, expiresInMinutes, appName = "Your App" }) => {
  const transporter = createTransporter();
  const timestamp = new Date().toLocaleTimeString();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `${appName} <no-reply@example.com>`,
    to,
    subject: `${appName} Security Code [${timestamp}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">${appName}</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">You requested to reset your password. Here is your 6-digit verification code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background-color: #f3f4f6; padding: 15px 25px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in ${expiresInMinutes} minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (!process.env.SMTP_HOST) {
    console.log("OTP email preview (no SMTP configured):", info.message);
  }

  return info;
};

module.exports = {
  sendOtpEmail,
};
