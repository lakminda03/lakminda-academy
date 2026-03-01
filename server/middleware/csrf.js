import crypto from "crypto";

export const CSRF_COOKIE_NAME = "lakminda_csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

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

const newCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const getCsrfTokenFromReq = (req) => {
  if (req.csrfToken) return req.csrfToken;
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[CSRF_COOKIE_NAME] || "";
};

export const ensureCsrfCookie = (req, res, next) => {
  const existing = getCsrfTokenFromReq(req);
  if (existing) {
    req.csrfToken = existing;
    return next();
  }

  const token = newCsrfToken();

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  req.csrfToken = token;
  return next();
};

export const requireCsrf = ({ ignorePaths = [] } = {}) => {
  const ignores = new Set(ignorePaths);
  return (req, res, next) => {
    const method = String(req.method || "GET").toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) return next();
    if (ignores.has(req.path)) return next();

    const cookieToken = getCsrfTokenFromReq(req);
    const headerToken = String(req.headers[CSRF_HEADER_NAME] || "").trim();
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ message: "Invalid CSRF token" });
    }
    return next();
  };
};
