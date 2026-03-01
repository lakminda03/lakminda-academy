import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import userRoutes from "./routes/users.js";
import contactRoutes from "./routes/contact.js";
import paymentRoutes from "./routes/payments.js";
import { ensureCsrfCookie, getCsrfTokenFromReq, requireCsrf } from "./middleware/csrf.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(ensureCsrfCookie);
app.use(
  requireCsrf({
    ignorePaths: ["/api/payments/payhere/notify"],
  })
);
app.use("/uploads/courses", express.static(path.resolve("uploads", "courses")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: getCsrfTokenFromReq(req) });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payments", paymentRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

start();
