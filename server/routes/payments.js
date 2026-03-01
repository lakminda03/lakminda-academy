import crypto from "crypto";
import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

const md5 = (value) => crypto.createHash("md5").update(value).digest("hex");
const checkoutLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: "Too many payment requests. Please try again later.",
});

const merchantSecretDigest = (merchantSecret) => md5(merchantSecret).toUpperCase();

const computeCheckoutHash = ({ merchantId, orderId, amount, currency, merchantSecret }) => {
  return md5(merchantId + orderId + amount + currency + merchantSecretDigest(merchantSecret)).toUpperCase();
};

const computeNotifyHash = ({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
}) => {
  return md5(
    merchantId + orderId + payhereAmount + payhereCurrency + statusCode + merchantSecretDigest(merchantSecret)
  ).toUpperCase();
};

const ensureEnrollment = async ({ userId, courseId }) => {
  const user = await User.findById(userId);
  if (!user) return;
  const already = user.enrolledCourses.find((c) => c.course.toString() === courseId.toString());
  if (!already) {
    user.enrolledCourses.push({ course: courseId, completedLessons: [], progress: 0, completedAt: null });
    await user.save();
  }
};

router.post("/payhere/checkout", requireAuth, checkoutLimiter, async (req, res) => {
  try {
    const merchantId = String(process.env.PAYHERE_MERCHANT_ID || "").trim();
    const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || "").trim();
    const sandbox = String(process.env.PAYHERE_SANDBOX || "true").toLowerCase() !== "false";

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({ message: "PayHere credentials are not configured" });
    }

    const courseId = String(req.body?.courseId || "").trim();
    const course = await Course.findById(courseId).select("title price");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (Number(course.price || 0) < 1) {
      return res.status(400).json({ message: "Payment is required only for courses priced at $1 or more" });
    }

    const amount = Number(course.price || 0).toFixed(2);
    const currency = "USD";
    const orderId = `LAK-COURSE-${course._id}-${Date.now()}`;
    await Payment.create({
      orderId,
      user: req.user._id,
      course: course._id,
      amount: Number(amount),
      currency,
      provider: "payhere",
      status: "pending",
    });

    const firstOrigin = String(process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0].trim();
    const origin = String(firstOrigin || "http://localhost:5173").trim();
    const returnUrl = `${origin}/courses?payment=success&courseId=${course._id}&orderId=${encodeURIComponent(orderId)}`;
    const cancelUrl = `${origin}/courses?payment=cancel&courseId=${course._id}&orderId=${encodeURIComponent(orderId)}`;
    const notifyBase = `${req.protocol}://${req.get("host")}`;
    const notifyUrl = `${notifyBase}/api/payments/payhere/notify`;

    const fullName = String(req.user?.name || "Lakminda Student").trim();
    const [firstName = "Lakminda", ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(" ") || "Student";
    const email = String(req.user?.email || "student@lakminda.local").trim().toLowerCase();

    const hash = computeCheckoutHash({ merchantId, orderId, amount, currency, merchantSecret });

    const action = sandbox
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

    return res.json({
      action,
      payload: {
        merchant_id: merchantId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: orderId,
        items: course.title,
        currency,
        amount,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: "0700000000",
        address: "Lakminda Academy",
        city: "Colombo",
        country: "Sri Lanka",
        custom_1: String(req.user._id),
        custom_2: String(course._id),
        hash,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to initialize payment" });
  }
});

router.post("/payhere/notify", async (req, res) => {
  try {
    const merchantId = String(process.env.PAYHERE_MERCHANT_ID || "").trim();
    const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || "").trim();
    const orderId = String(req.body?.order_id || "").trim();
    const statusCode = String(req.body?.status_code || "").trim();
    const payhereAmount = String(req.body?.payhere_amount || "").trim();
    const payhereCurrency = String(req.body?.payhere_currency || "").trim();
    const md5sig = String(req.body?.md5sig || "").trim().toUpperCase();
    const paymentId = String(req.body?.payment_id || "").trim();
    const incomingMerchant = String(req.body?.merchant_id || "").trim();

    if (!merchantId || !merchantSecret || !orderId || !statusCode || !payhereAmount || !payhereCurrency || !md5sig) {
      return res.status(400).send("INVALID");
    }
    if (incomingMerchant !== merchantId) {
      return res.status(400).send("INVALID");
    }

    const expected = computeNotifyHash({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      merchantSecret,
    });
    if (expected !== md5sig) {
      return res.status(400).send("INVALID");
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).send("NOT_FOUND");
    }

    if (statusCode === "2") {
      payment.status = "success";
      payment.paidAt = new Date();
      payment.providerPaymentId = paymentId;
      await payment.save();
      await ensureEnrollment({ userId: payment.user, courseId: payment.course });
      return res.status(200).send("OK");
    }

    payment.status = statusCode === "-1" ? "canceled" : "failed";
    payment.providerPaymentId = paymentId;
    await payment.save();
    return res.status(200).send("OK");
  } catch {
    return res.status(500).send("ERROR");
  }
});

router.post("/payhere/confirm", requireAuth, async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || "").trim();
    const courseId = String(req.body?.courseId || "").trim();
    if (!orderId || !courseId) {
      return res.status(400).json({ message: "orderId and courseId are required" });
    }

    const payment = await Payment.findOne({
      orderId,
      user: req.user._id,
      course: courseId,
      provider: "payhere",
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.status !== "success") {
      return res.status(409).json({ message: "Payment is not confirmed yet" });
    }

    await ensureEnrollment({ userId: req.user._id, courseId });
    return res.json({ message: "Payment confirmed and enrollment activated" });
  } catch {
    return res.status(500).json({ message: "Failed to confirm payment" });
  }
});

export default router;
