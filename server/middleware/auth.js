import { verifyToken } from "../utils/token.js";
import User from "../models/User.js";

const parseCookies = (cookieHeader = "") => {
  return String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return acc;
      const key = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const getRequestToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.lakminda_token || null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getRequestToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select(
<<<<<<< HEAD
      "-passwordHash -emailVerificationTokenHash -passwordResetTokenHash"
=======
      "-passwordHash -passwordResetTokenHash -emailVerificationTokenHash"
>>>>>>> 2894c84 (Update README and env template)
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = getRequestToken(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("role enrolledCourses.course");
    req.user = user || null;
    return next();
  } catch {
    req.user = null;
    return next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
<<<<<<< HEAD

=======
>>>>>>> 2894c84 (Update README and env template)
