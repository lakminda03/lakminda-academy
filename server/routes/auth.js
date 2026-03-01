import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
  sendVerificationEmail,
} from "../utils/emailVerification.js";
import {
<<<<<<< HEAD
=======
  hasValidMxRecord,
  isDisposableEmail,
  isEmailFormatValid,
} from "../utils/emailDomainValidation.js";
import {
>>>>>>> 2894c84 (Update README and env template)
  createPasswordResetToken,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "../utils/passwordReset.js";

const router = express.Router();
const tokenCookieName = "lakminda_token";
const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many registration attempts. Please try again later.",
});
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
});
const verificationLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many verification requests. Please try again later.",
});
const forgotLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many reset requests. Please try again later.",
});

<<<<<<< HEAD
=======
const readBodyString = (value) => (typeof value === "string" ? value : "");
const hasUnsafeHtml = (value) => /<[^>]*>|javascript:|on\w+\s*=/i.test(String(value || ""));

>>>>>>> 2894c84 (Update README and env template)
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

const issueVerification = async (user) => {
  const { token, tokenHash, expiresAt } = createEmailVerificationToken();
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  await user.save();
  await sendVerificationEmail({ email: user.email, name: user.name, token });
};

const issuePasswordReset = async (user) => {
  const { token, tokenHash, expiresAt } = createPasswordResetToken();
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();
  await sendPasswordResetEmail({ email: user.email, name: user.name, token });
};

router.post("/register", registerLimiter, async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.toLowerCase();
=======
    const name = readBodyString(req.body?.name).trim();
    const email = readBodyString(req.body?.email).trim();
    const password = readBodyString(req.body?.password);
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (name.length < 2 || name.length > 80 || hasUnsafeHtml(name)) {
      return res.status(400).json({ message: "Please enter a valid name" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (password.length > 72) {
      return res.status(400).json({ message: "Password must be 72 characters or fewer" });
    }

    const normalizedEmail = email.toLowerCase();
    if (!isEmailFormatValid(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (await isDisposableEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Temporary/disposable emails are not allowed" });
    }
    if (!(await hasValidMxRecord(normalizedEmail))) {
      return res.status(400).json({ message: "Email domain is invalid or cannot receive mail" });
    }

>>>>>>> 2894c84 (Update README and env template)
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      if (exists.emailVerified) {
        return res.status(409).json({ message: "Email already in use" });
      }

<<<<<<< HEAD
      const passwordHash = await bcrypt.hash(password, 10);
      exists.name = name;
      exists.passwordHash = passwordHash;
      await exists.save();
      await issueVerification(exists);
=======
      exists.name = name;
      exists.passwordHash = await bcrypt.hash(password, 10);
      exists.emailVerified = false;
      exists.emailVerifiedAt = null;
      await issueVerification(exists);

>>>>>>> 2894c84 (Update README and env template)
      return res.json({
        message: "Account exists but is not verified. We sent a new verification email.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false,
    });

    await issueVerification(user);

    return res.json({
      message: "Registration successful. Please verify your email before signing in.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed" });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
<<<<<<< HEAD
    const token = String(req.query.token || "");
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }
=======
    const token = String(req.query?.token || "").trim();
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: "Verification token is invalid" });
    }
>>>>>>> 2894c84 (Update README and env template)

    const tokenHash = hashEmailVerificationToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or expired" });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

<<<<<<< HEAD
    return res.json({ message: "Email verified successfully" });
=======
    return res.json({ message: "Email verified successfully. You can now sign in." });
>>>>>>> 2894c84 (Update README and env template)
  } catch (err) {
    return res.status(500).json({ message: "Email verification failed" });
  }
});

router.post("/resend-verification", verificationLimiter, async (req, res) => {
  try {
<<<<<<< HEAD
    const email = String(req.body?.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (user && !user.emailVerified) {
      await issueVerification(user);
    }
=======
    const email = readBodyString(req.body?.email).trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!isEmailFormatValid(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (await isDisposableEmail(email)) {
      return res.status(400).json({ message: "Temporary/disposable emails are not allowed" });
    }
    if (!(await hasValidMxRecord(email))) {
      return res.status(400).json({ message: "Email domain is invalid or cannot receive mail" });
    }

    const user = await User.findOne({ email });
    if (user && !user.emailVerified) {
      const tokenExpired =
        !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= new Date();
      const tokenMissing = !user.emailVerificationTokenHash;

      if (tokenExpired || tokenMissing) {
        await issueVerification(user);
      } else {
        return res.json({
          message: "Your current verification link is still valid. Please check your email inbox.",
        });
      }
    }

>>>>>>> 2894c84 (Update README and env template)
    return res.json({
      message: "If an account exists and is not verified, a verification email has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
});

router.post("/forgot-password", forgotLimiter, async (req, res) => {
  try {
<<<<<<< HEAD
    const email = String(req.body?.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
=======
    const email = readBodyString(req.body?.email).toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!isEmailFormatValid(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
>>>>>>> 2894c84 (Update README and env template)

    const user = await User.findOne({ email });
    if (user) {
      await issuePasswordReset(user);
    }

    return res.json({
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to process password reset request" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
<<<<<<< HEAD
    const token = String(req.body?.token || "");
    const password = String(req.body?.password || "");
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
=======
    const token = readBodyString(req.body?.token).trim();
    const password = readBodyString(req.body?.password);
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: "Token is invalid" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    if (password.length > 72) {
      return res.status(400).json({ message: "Password must be 72 characters or fewer" });
    }
>>>>>>> 2894c84 (Update README and env template)

    const tokenHash = hashPasswordResetToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset link is invalid or expired" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successful. Please sign in." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
<<<<<<< HEAD
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
=======
    const email = readBodyString(req.body?.email).trim().toLowerCase();
    const password = readBodyString(req.body?.password);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    if (!isEmailFormatValid(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email });
>>>>>>> 2894c84 (Update README and env template)
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.emailVerified && user.role !== "admin") {
      return res.status(403).json({
        message: "Please verify your email before signing in",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const token = signToken({ id: user._id, role: user.role });
    res.cookie(tokenCookieName, token, tokenCookieOptions);
    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(tokenCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.json({ message: "Logged out" });
});

export default router;
