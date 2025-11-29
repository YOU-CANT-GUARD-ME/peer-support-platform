  import express from "express";
  import mongoose from "mongoose";
  import cors from "cors";
  import dotenv from "dotenv";
  import Post from "./models/Post.js";
  import Diary from "./models/Diary.js";
  import SupportGroup from "./models/supportGroup.js";
  import path from "path";
  import { fileURLToPath } from "url";

  dotenv.config();

  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // ---------------------------
  // CORS
  // ---------------------------
  app.use(
    cors({
      origin: ["http://localhost:5173"], // frontend origin
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  app.use(express.json());

  // ---------------------------
  // MongoDB
  // ---------------------------
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

  // ---------------------------
  // Posts API
  // ---------------------------
  app.get("/api/posts", async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    const { title, content } = req.body;
    const newPost = new Post({ title, content });
    await newPost.save();
    res.status(201).json(newPost);
  });

  app.delete("/api/posts/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    const { username, content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.comments.push({ username, content, replies: [] });
    await post.save();
    res.json(post);
  });

  app.post("/api/posts/:id/me-too", async (req, res) => {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.meTooUsers.includes(userId)) {
      return res.status(400).json({ message: "Already clicked Me Too" });
    }

    post.meTooUsers.push(userId);
    post.meTooCount = post.meTooUsers.length;
    await post.save();
    res.json(post);
  });

  // ---------------------------
  // Diary API
  // ---------------------------
  app.get("/api/diary", async (req, res) => {
    const entries = await Diary.find().sort({ createdAt: -1 });
    res.json(entries);
  });

  app.post("/api/diary", async (req, res) => {
    const { emotion, content, themeId } = req.body;
    try {
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

  app.get ("/api/groups", async (req, res) => {
    try {
      const groups = await SupportGroup.find().sort({ createdAt: -1 });
      res.json(groups);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch groups", error: err.message });
    }
  });

  // create new group
  app.post("/api/groups", async (req, res) => {
    const { name, limit, category, desc } = req.body;

    try {
      const group = new SupportGroup({
        name,
        limit,
        category,
        desc,
        members: 1,
      });

      await group.save();
      res.status(201).json(group);
    } catch (err) {
      res.status(500).json({ message: "Failed to create group", error: err.message });
    }
  });

// delete a group
  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const group = await SupportGroup.findByIdAndDelete(req.params.id);

      if(!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json({ message: "Group deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete group", error: err.message });
    }
  });

  // ---------------------------
  // Start Server
  // ---------------------------
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
