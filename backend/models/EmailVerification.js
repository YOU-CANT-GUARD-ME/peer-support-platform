// models/EmailVerification.js
import mongoose from "mongoose";

const EmailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  verified: { type: Boolean, default: false },   // ← 추가
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

export default mongoose.model("EmailVerification", EmailVerificationSchema);
