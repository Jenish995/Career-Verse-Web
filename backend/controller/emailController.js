const nodemailer = require("nodemailer");

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

const sendPasswordResetOtp = async ({ to, otp, expiresInMinutes }) => {
  const transporter = createTransporter();

  const timestamp = new Date().toLocaleTimeString();
  
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "Career Verse <no-reply@careerverse.com>",
    to,
    subject: `Career Verse Security Code [${timestamp}]`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">Career Verse</h2>
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
    console.log("Password reset email preview:", info.message);
  }

  return info;
};

module.exports = {
  sendPasswordResetOtp,
};
