import crypto from "crypto";
import { sendEmail } from "./mailer.js";

const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

<<<<<<< HEAD
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
=======
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveClientOrigin = () => {
  const rawOrigins = String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return rawOrigins[0] || "http://localhost:5173";
};
>>>>>>> 2894c84 (Update README and env template)

export const createEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
  };
};

export const hashEmailVerificationToken = (token) => sha256(token);

export const buildVerificationLink = (token) => {
<<<<<<< HEAD
  const clientOrigin = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() || "http://localhost:5173";
=======
  const clientOrigin = resolveClientOrigin();
>>>>>>> 2894c84 (Update README and env template)
  return `${clientOrigin}/verify-email?token=${encodeURIComponent(token)}`;
};

export const sendVerificationEmail = async ({ email, name, token }) => {
  const link = buildVerificationLink(token);
<<<<<<< HEAD
  const safeName = name || "there";
  const subject = "Verify your Lakminda Academy account";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Welcome to Lakminda Academy</h2>
      <p>Hi ${safeName},</p>
      <p>Please verify your email to activate your account.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#5ee4ff;color:#111;text-decoration:none;border-radius:999px;">Verify Email</a></p>
      <p>If the button does not work, open this link:</p>
      <p>${link}</p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;

  const result = await sendEmail({ to: email, subject, html });
  if (result?.skipped) {
    console.log(`[Email Verification] Send this link to ${safeName}: ${link}`);
  }
  return result;
=======
  const safeName = String(name || "there").trim() || "there";
  const safeNameHtml = escapeHtml(safeName);
  const subject = "Verify your Lakminda Academy account";
  const html = `
    <div style="margin:0;padding:24px;background:#f4f8ff;font-family:Arial,sans-serif;color:#111;line-height:1.6;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #dbe7ff;">
              <tr><td>
                <h2 style="margin:0 0 14px 0;">Verify Your Email Address</h2>
                <p style="margin:0 0 12px 0;">Hi ${safeNameHtml},</p>
                <p style="margin:0 0 12px 0;">Thanks for joining Lakminda Academy. Please verify your email to activate your account.</p>
                <p style="margin:20px 0;">
                  <a href="${link}" style="display:inline-block;padding:12px 18px;background:#0f6fff;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:bold;">
                    Verify Email
                  </a>
                </p>
                <p style="margin:0 0 8px 0;">If the button does not work, use this link:</p>
                <p style="margin:0 0 12px 0;word-break:break-all;"><a href="${link}">${link}</a></p>
                <p style="margin:0 0 8px 0;">This link expires in 24 hours.</p>
                <p style="margin:0;">If you did not create this account, you can ignore this email.</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
  const text = [
    `Hi ${safeName},`,
    "",
    "Thanks for joining Lakminda Academy.",
    "Please verify your email to activate your account:",
    link,
    "",
    "This link expires in 24 hours.",
    "If you did not create this account, you can ignore this email.",
  ].join("\n");

  const result = await sendEmail({ to: email, subject, html, text });
  if (result?.skipped) {
    console.log(`[Email Verification] Send this link to ${safeName}: ${link}`);
  }
>>>>>>> 2894c84 (Update README and env template)
};
