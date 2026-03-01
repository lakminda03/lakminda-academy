import crypto from "crypto";
import { sendEmail } from "./mailer.js";

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
<<<<<<< HEAD
=======
const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
>>>>>>> 2894c84 (Update README and env template)

export const createPasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  };
};

export const hashPasswordResetToken = (token) => sha256(token);

export const buildPasswordResetLink = (token) => {
  const clientOrigin = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() || "http://localhost:5173";
  return `${clientOrigin}/reset-password?token=${encodeURIComponent(token)}`;
};

export const sendPasswordResetEmail = async ({ email, name, token }) => {
  const link = buildPasswordResetLink(token);
  const safeName = name || "there";
<<<<<<< HEAD
=======
  const safeNameHtml = escapeHtml(safeName);
>>>>>>> 2894c84 (Update README and env template)
  const subject = "Reset your Lakminda Academy password";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Password Reset Request</h2>
<<<<<<< HEAD
      <p>Hi ${safeName},</p>
=======
      <p>Hi ${safeNameHtml},</p>
>>>>>>> 2894c84 (Update README and env template)
      <p>We received a request to reset your password.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#5ee4ff;color:#111;text-decoration:none;border-radius:999px;">Reset Password</a></p>
      <p>If the button does not work, open this link:</p>
      <p>${link}</p>
      <p>This link expires in 30 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;
<<<<<<< HEAD

  const result = await sendEmail({ to: email, subject, html });
=======
  const text = [
    `Hi ${safeName},`,
    "",
    "We received a request to reset your password.",
    "Use this link to reset your password:",
    link,
    "",
    "This link expires in 30 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const result = await sendEmail({ to: email, subject, html, text });
>>>>>>> 2894c84 (Update README and env template)
  if (result?.skipped) {
    console.log(`[Password Reset] Send this link to ${safeName}: ${link}`);
  }
  return result;
};
