import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    provider: { type: String, required: true, default: "payhere" },
    status: { type: String, enum: ["pending", "success", "failed", "canceled"], default: "pending", index: true },
    paidAt: { type: Date, default: null },
    providerPaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, course: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);

