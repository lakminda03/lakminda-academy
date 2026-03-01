import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    assignmentType: { type: String, enum: ["none", "exam", "project"], default: "none" },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "General" },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    lessons: { type: [lessonSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
