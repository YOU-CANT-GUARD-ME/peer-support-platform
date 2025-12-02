// ---------------------------
// server.js - Full API + Chat + Frontend
// ---------------------------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Models
import User from "./models/User.js";
import Post from "./models/Post.js";
import Diary from "./models/Diary.js";
import SupportGroup from "./models/supportGroup.js";
import ChatMessage from "./models/ChatMessage.js";

// Routes
import authRoutes from "./auth.js";
import createAuthVerifyRoutes from "./authVerify.js";
import groupRoutes from "./router/Group-router.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// EMAIL VERIFICATION
// ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ---------------------------
// MIDDLEWARE
// ---------------------------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// JWT Auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ message: "Invalid Authorization format" });

  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ---------------------------
// DATABASE
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ---------------------------
// AUTH ROUTES
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/verify", createAuthVerifyRoutes(transporter));

// ---------------------------
// POSTS
// ---------------------------
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts", requireAuth, async (req, res) => {
  try {
    const newPost = new Post({ ...req.body, userId: req.userId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { username, content } = req.body;
    if (!content?.trim())
      return res.status(400).json({ message: "Comment cannot be empty" });

    post.comments = post.comments || [];
    post.comments.push({ username, content });
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/metoo", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.meTooUsers.includes(req.userId))
      return res.status(400).json({ message: "Already MeToo" });

    post.meTooUsers.push(req.userId);
    post.meTooCount = post.meTooUsers.length;
    await post.save();

    res.json({ message: "MeToo added", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/posts/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Post.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted)
      return res.status(404).json({ message: "Post not found or unauthorized" });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------
// DIARY
// ---------------------------
app.get("/api/diary", requireAuth, async (req, res) => {
  try {
    const entries = await Diary.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/diary", requireAuth, async (req, res) => {
  try {
    const newEntry = new Diary({ ...req.body, userId: req.userId });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/diary/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Diary.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deleted) return res.status(404).json({ message: "Diary not found" });
    res.json({ message: "Diary deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------
// SUPPORT GROUPS
// ---------------------------
app.use("/api/groups", groupRoutes);

// ---------------------------
// SOCKET.IO CHAT + SERVER
// ---------------------------
const httpServer = createServer(app); // <-- only once

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = {}; // { roomId: [nickname1, nickname2, ...] }

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, nickname }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(nickname);
    socket.join(roomId);
    io.to(roomId).emit("userList", rooms[roomId]);
  });

  socket.on("sendMessage", async ({ roomId, nickname, message }) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    const chatMessage = new ChatMessage({ roomId, nickname, message });
    await chatMessage.save();
    io.to(roomId).emit("receiveMessage", chatMessage);
  });

  socket.on("leaveRoom", ({ roomId, nickname }) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((n) => n !== nickname);
      socket.leave(roomId);
      io.to(roomId).emit("userList", rooms[roomId]);
    }
  });

  socket.on("disconnect", () => {
    console.log("⚡ User disconnected:", socket.id);
  });
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
