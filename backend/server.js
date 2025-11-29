import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import Post from "./models/Post.js";
import Diary from "./models/Diary.js";
import SupportGroup from "./models/supportGroup.js";
import authRoutes from "./auth.js";
import createAuthVerifyRoutes from "./authVerify.js";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// Nodemailer
// ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // 앱 비밀번호
  },
});

// ---------------------------
// CORS & JSON
// ---------------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ---------------------------
// MongoDB
// ---------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err.message));

// ---------------------------
// Auth Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/verify", createAuthVerifyRoutes(transporter)); // 함수 호출

// ---------------------------
// JWT Middleware
// ---------------------------
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid Authorization format" });

  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    req.userId = payload.id || payload._id || payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ---------------------------
// API 라우터 (Posts, Diary, Groups) 등은 기존 코드 그대로
// ---------------------------
// 예: app.get("/api/posts", ...), app.post("/api/diary", ...) 등

// ---------------------------
// Serve frontend
// ---------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
