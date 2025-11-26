import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import SupportGroup from "./models/supportGroup.js";
import authRoutes from "./auth.js";
import Diary from "./models/Diary.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// --- Posts API ---
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Create Post
app.post("/api/posts", async (req, res) => {
  const { title, content } = req.body;
  const newPost = new Post({ title, content });
  await newPost.save();
  res.json(newPost);
});

// --- Support Groups API ---

// Get all groups
app.get("/api/groups", async (req, res) => {
  const groups = await SupportGroup.find().sort({ createdAt: -1 });
  res.json(groups);
});

// Create new group
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

// Delete a group
app.delete("/api/groups/:id", async (req, res) => {
  try {
    const deleted = await SupportGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete group", error: err.message });
  }
});

// --- Diary API ---
app.get("/api/diary", async (req, res) => {
  const entries = await Diary.find().sort({ createdAt: -1 });
  res.json(entries);
});

app.post("/api/diary", async (req, res) => {
  try {
    const { emotion, content, themeId } = req.body;
    const entry = new Diary({ emotion, content, themeId });
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Diary save error", error: err.message });
  }
});

app.delete("/api/diary/:id", async (req, res) => {
  await Diary.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
