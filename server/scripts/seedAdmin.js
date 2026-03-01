import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = (process.env.ADMIN_EMAIL || "admin@lakminda.local").toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "").trim();
    if (!password) {
      throw new Error("ADMIN_PASSWORD is required");
    }
    if (password.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name: "Admin",
      email,
      passwordHash,
      role: "admin",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
    console.log("Admin created", email);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
    process.exit(1);
  }
};

run();
