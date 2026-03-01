const buckets = new Map();

const defaultKeyGenerator = (req) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  return String(ip);
};

export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please try again later.",
  keyGenerator = defaultKeyGenerator,
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({ message });
    }

    return next();
  };
};

