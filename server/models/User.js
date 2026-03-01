import mongoose from "mongoose";

const enrolledCourseSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: [Number], default: [] },
    progress: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    awardedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    enrolledCourses: { type: [enrolledCourseSchema], default: [] },
    achievements: { type: [achievementSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
