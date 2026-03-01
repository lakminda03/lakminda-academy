import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();
const contactLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: "Too many contact submissions. Please try again later.",
});

router.post("/", contactLimiter, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const message = String(req.body?.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load contact messages" });
  }
});

export default router;
