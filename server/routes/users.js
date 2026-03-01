import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("enrolledCourses.course")
    .populate("achievements.course")
<<<<<<< HEAD
    .select("-passwordHash -emailVerificationTokenHash -passwordResetTokenHash");
=======
    .select("-passwordHash -passwordResetTokenHash -emailVerificationTokenHash");
>>>>>>> 2894c84 (Update README and env template)
  res.json(user);
});

router.get("/admin-overview", requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find()
    .populate("enrolledCourses.course", "title category")
    .populate("achievements.course", "title")
    .select(
      "name email role emailVerified createdAt enrolledCourses.course enrolledCourses.progress enrolledCourses.completedAt achievements"
    )
    .sort({ createdAt: -1 });

  const payload = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
    totalEnrollments: user.enrolledCourses?.length || 0,
    completedCourses: user.enrolledCourses?.filter((item) => Number(item.progress) === 100).length || 0,
    totalAchievements: user.achievements?.length || 0,
    enrolledCourses: (user.enrolledCourses || []).map((item) => ({
      courseId: item.course?._id || null,
      title: item.course?.title || "Untitled course",
      category: item.course?.category || "General",
      progress: Number(item.progress) || 0,
      completedAt: item.completedAt || null,
    })),
  }));

  res.json(payload);
});

export default router;
