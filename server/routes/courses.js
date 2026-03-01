import express from "express";
import fs from "fs/promises";
import path from "path";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
const uploadsDir = path.resolve("uploads", "courses");
const submissionsDir = path.resolve("uploads", "submissions");

const mimeExtensions = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const saveCourseImageFromDataUrl = async (dataUrl) => {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image format");
  }
  const mimeType = match[1].toLowerCase();
  const ext = mimeExtensions[mimeType];
  if (!ext) {
    throw new Error("Only JPG, PNG, WEBP, and GIF are supported");
  }
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller");
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `course-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.writeFile(path.join(uploadsDir, fileName), buffer);
  return `/uploads/courses/${fileName}`;
};

const deleteCourseImageIfLocal = async (imageUrl) => {
  if (!imageUrl || !String(imageUrl).startsWith("/uploads/courses/")) return;
  const fileName = imageUrl.replace("/uploads/courses/", "");
  try {
    await fs.unlink(path.join(uploadsDir, fileName));
  } catch {
    // Ignore cleanup errors.
  }
};

const sanitizePathSegment = (value) => String(value || "").replace(/[^a-zA-Z0-9._-]/g, "_");

const sanitizeRelativePath = (relativePath, fallbackName) => {
  const raw = String(relativePath || fallbackName || "file").replace(/\\/g, "/");
  const normalized = path.posix.normalize(raw);
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../") || normalized.startsWith("/")) {
    return sanitizePathSegment(fallbackName || "file");
  }
  return normalized
    .split("/")
    .map((segment) => sanitizePathSegment(segment))
    .filter(Boolean)
    .join("/");
};

const saveSubmissionFiles = async ({ courseId, lessonIndex, userId, files }) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files uploaded");
  }
  if (files.length > 200) {
    throw new Error("Too many files. Limit is 200 files per submission");
  }

  const stamp = `${Date.now()}`;
  const submissionRoot = path.join(
    submissionsDir,
    `course-${sanitizePathSegment(courseId)}`,
    `user-${sanitizePathSegment(userId)}`,
    `lesson-${lessonIndex + 1}`,
    stamp
  );

  let totalBytes = 0;
  let savedCount = 0;
  for (const file of files) {
    const dataUrl = String(file?.dataUrl || "");
    const match = dataUrl.match(/^data:.*;base64,(.+)$/);
    if (!match) continue;
    const buffer = Buffer.from(match[1], "base64");
    if (!buffer.length) continue;
    totalBytes += buffer.length;
    if (totalBytes > 25 * 1024 * 1024) {
      throw new Error("Submission is too large. Limit is 25MB total");
    }

    const safeRelative = sanitizeRelativePath(file.relativePath, file.name);
    const targetPath = path.join(submissionRoot, safeRelative);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, buffer);
    savedCount += 1;
  }

  if (savedCount === 0) {
    throw new Error("No valid files in submission");
  }

  return {
    path: submissionRoot,
    filesSaved: savedCount,
    submittedAt: new Date().toISOString(),
  };
};

const getCourseWithValidLesson = async (courseId, lessonIndexParam) => {
  const course = await Course.findById(courseId);
  if (!course) {
    return { error: { code: 404, message: "Course not found" } };
  }

  const lessonIndex = Number(lessonIndexParam);
  if (Number.isNaN(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.lessons.length) {
    return { error: { code: 400, message: "Invalid lesson index" } };
  }

  return { course, lessonIndex };
};

const canAccessPaidContent = (user, course) => {
  if (Number(course.price || 0) < 1) return true;
  if (!user) return false;
  if (user.role === "admin") return true;
  return (user.enrolledCourses || []).some((item) => item.course?.toString() === course._id.toString());
};

const toSafeCoursePayload = (course, user) => {
  const plain = typeof course.toObject === "function" ? course.toObject() : { ...course };
  if (canAccessPaidContent(user, plain)) {
    return plain;
  }
  return {
    ...plain,
    lessons: (plain.lessons || []).map((lesson) => ({
      ...lesson,
      content: "",
    })),
  };
};

router.get("/", optionalAuth, async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses.map((course) => toSafeCoursePayload(course, req.user)));
});

router.get("/:id", optionalAuth, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.json(toSafeCoursePayload(course, req.user));
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, price, lessons, imageDataUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    let imageUrl = "";
    if (imageDataUrl) {
      imageUrl = await saveCourseImageFromDataUrl(imageDataUrl);
    }

    const course = await Course.create({
      title,
      description,
      category,
      price,
      imageUrl,
      lessons: lessons || [],
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to create course" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, price, lessons, imageDataUrl } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let nextImageUrl = course.imageUrl || "";
    if (imageDataUrl) {
      nextImageUrl = await saveCourseImageFromDataUrl(imageDataUrl);
      await deleteCourseImageIfLocal(course.imageUrl);
    }

    course.title = title;
    course.description = description;
    course.category = category;
    course.price = price;
    course.lessons = lessons;
    course.imageUrl = nextImageUrl;
    await course.save();

    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to update course" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  await deleteCourseImageIfLocal(course.imageUrl);
  res.json({ message: "Course deleted" });
});

router.post("/:id/enroll", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (req.user.role !== "admin" && Number(course.price || 0) >= 1) {
    const hasPaid = await Payment.exists({
      user: req.user._id,
      course: course._id,
      provider: "payhere",
      status: "success",
    });
    if (!hasPaid) {
      return res.status(402).json({ message: "Payment required before enrollment" });
    }
  }

  const user = await User.findById(req.user._id);
  const already = user.enrolledCourses.find((c) => c.course.toString() === course._id.toString());
  if (!already) {
    user.enrolledCourses.push({ course: course._id, completedLessons: [], progress: 0, completedAt: null });
    await user.save();
  }
  res.json({ message: "Enrolled", courseId: course._id });
});

router.delete("/:id/enroll", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const user = await User.findById(req.user._id);
  const beforeCount = user.enrolledCourses.length;
  user.enrolledCourses = user.enrolledCourses.filter((item) => item.course.toString() !== course._id.toString());
  user.achievements = user.achievements.filter((item) => item.course.toString() !== course._id.toString());

  if (user.enrolledCourses.length === beforeCount) {
    return res.status(400).json({ message: "Not enrolled" });
  }

  await user.save();
  res.json({ message: "Unenrolled", courseId: course._id });
});

router.post("/:id/lessons/:lessonIndex/complete", requireAuth, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  const lessonIndex = Number(req.params.lessonIndex);
  if (Number.isNaN(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.lessons.length) {
    return res.status(400).json({ message: "Invalid lesson index" });
  }
  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.find((c) => c.course.toString() === course._id.toString());
  if (!enrolled) {
    return res.status(400).json({ message: "Not enrolled" });
  }
  if (!enrolled.completedLessons.includes(lessonIndex)) {
    enrolled.completedLessons.push(lessonIndex);
  }
  const progress = Math.round((enrolled.completedLessons.length / course.lessons.length) * 100);
  enrolled.progress = progress;
  if (progress === 100 && !enrolled.completedAt) {
    enrolled.completedAt = new Date();
    const alreadyAwarded = user.achievements.some((a) => a.course.toString() === course._id.toString());
    if (!alreadyAwarded) {
      user.achievements.push({ course: course._id, awardedAt: new Date() });
    }
  }
  await user.save();
  res.json({ progress: enrolled.progress, completedAt: enrolled.completedAt, achievements: user.achievements });
});

router.post("/:id/lessons/:lessonIndex/submissions", requireAuth, async (req, res) => {
  try {
    const validated = await getCourseWithValidLesson(req.params.id, req.params.lessonIndex);
    if (validated.error) {
      return res.status(validated.error.code).json({ message: validated.error.message });
    }
    const { course, lessonIndex } = validated;

    const lesson = course.lessons[lessonIndex];
    const assignmentType = lesson.assignmentType || "none";
    if (assignmentType === "none") {
      return res.status(400).json({ message: "Assignment upload is not enabled for this lesson" });
    }

    const user = await User.findById(req.user._id);
    const enrolled = user.enrolledCourses.find((c) => c.course.toString() === course._id.toString());
    if (!enrolled) {
      return res.status(400).json({ message: "Not enrolled" });
    }

    const result = await saveSubmissionFiles({
      courseId: course._id.toString(),
      lessonIndex,
      userId: user._id.toString(),
      files: req.body.files,
    });

    return res.json({
      message: "Assignment submitted successfully",
      filesSaved: result.filesSaved,
      submittedAt: result.submittedAt,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to submit assignment" });
  }
});

export default router;
