// server.js
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
import User from "./models/User.js"; // make sure this path matches your file

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: ["http://localhost:5173"], // update/add your frontend origins when deployed
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

// ---------------------------
// MongoDB
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

// ---------------------------
// Auth middleware (JWT)
// ---------------------------
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid Authorization format" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id || payload._id || payload.userId; // be flexible
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ---------------------------
// Posts API
// ---------------------------

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    // Return posts with meTooUsers as array of strings (ObjectId -> string)
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
});

// Create post (public — you can requireAuth here later)
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const newPost = new Post({
      title,
      content,
      // optionally store author if you want: author: userId
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post", error: err.message });
  }
});

// Delete post (keeps simple behavior — deletes any post by id)
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
});

// Add comment to a post
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const { username, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ username, content, replies: [] });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
});

// Me Too — **requires authentication**. Each user can Me Too a post once.
app.post("/api/posts/:id/me-too", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // ensure array exists
    if (!post.meTooUsers) post.meTooUsers = [];

    // If there are ObjectIds, convert them to strings for comparison
    const userStrings = post.meTooUsers.map(u => u.toString());

    if (userStrings.includes(userId.toString())) {
      return res.status(400).json({ message: "Already clicked Me Too" });
    }

    post.meTooUsers.push(userId);
    post.meTooCount = post.meTooUsers.length;

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------------
// Diary API
// ---------------------------
app.get("/api/diary", async (req, res) => {
  try {
    const entries = await Diary.find().sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch diary entries", error: err.message });
  }
});

app.post("/api/diary", async (req, res) => {
  try {
    const { emotion, content, themeId } = req.body;
    const entry = new Diary({ emotion, content, themeId });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: "Diary save error", error: err.message });
  }
});

app.delete("/api/diary/:id", async (req, res) => {
  try {
    await Diary.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete entry", error: err.message });
  }
});

// ---------------------------
// Support Groups API
// ---------------------------

app.get("/api/groups", async (req, res) => {
  try {
    const groups = await SupportGroup.find().sort({ createdAt: -1 }).lean();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch groups", error: err.message });
  }
});

app.post("/api/groups", async (req, res) => {
  try {
    const { name, limit, category, desc } = req.body;
    const group = new SupportGroup({ name, limit, category, desc, members: 1 });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: "Failed to create group", error: err.message });
  }
});

app.delete("/api/groups/:id", async (req, res) => {
  try {
    const deleted = await SupportGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete group", error: err.message });
  }
});

// ---------------------------
// Serve static frontend if present (optional)
// ---------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
