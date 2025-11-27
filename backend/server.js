import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Models
import Post from "./models/Post.js";
import SupportGroup from "./models/supportGroup.js";
import Diary from "./models/Diary.js";

// Auth routes
import authRoutes from "./auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.use("/api/auth", authRoutes);

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/*
|--------------------------------------------------------------------------
|  COMMUNITY POSTS API
|--------------------------------------------------------------------------
*/

// Get all posts
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Create post
app.post("/api/posts", async (req, res) => {
  const { title, content } = req.body;

  const newPost = new Post({
    title,
    content,
    comments: [],
    meTooCount: 0,
    meTooUsers: [],
  });

  await newPost.save();
  res.json(newPost);
});

// Delete post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
});

// Add comment
app.post("/api/posts/:id/comments", async (req, res) => {
  const { username, content } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ username, content, replies: [] });

  await post.save();
  res.json(post);
});

/*
|--------------------------------------------------------------------------
|  ME TOO BUTTON — USER CAN CLICK ONLY ONCE
|--------------------------------------------------------------------------
*/
app.post("/api/posts/:id/me-too", async (req, res) => {
  try {
    const { userId } = req.body; // must be sent from frontend
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Prevent duplicate Me Too
    if (post.meTooUsers.includes(userId)) {
      return res.status(400).json({ error: "User already reacted" });
    }

    post.meTooUsers.push(userId);
    post.meTooCount = post.meTooUsers.length; // sync count

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Me Too failed", details: err.message });
  }
});

/*
|--------------------------------------------------------------------------
|  SUPPORT GROUP API
|--------------------------------------------------------------------------
*/

// Get all groups
app.get("/api/groups", async (req, res) => {
  const groups = await SupportGroup.find().sort({ createdAt: -1 });
  res.json(groups);
});

// Create group
app.post("/api/groups", async (req, res) => {
  try {
    const { name, limit, category, desc } = req.body;
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

// Delete group
app.delete("/api/groups/:id", async (req, res) => {
  try {
    const deleted = await SupportGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Group not found" });
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete group", error: err.message });
  }
});

/*
|--------------------------------------------------------------------------
|  DIARY API
|--------------------------------------------------------------------------
*/

// Get all diary entries
app.get("/api/diary", async (req, res) => {
  const entries = await Diary.find().sort({ createdAt: -1 });
  res.json(entries);
});

// Create diary entry
app.post("/api/diary", async (req, res) => {
  try {
    const { emotion, content, themeId } = req.body;
    const entry = new Diary({
      emotion,
      content,
      themeId,
    });

    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Diary save error", error: err.message });
  }
});

// Delete diary entry
app.delete("/api/diary/:id", async (req, res) => {
  await Diary.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

/*
|--------------------------------------------------------------------------
|  SERVER START
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));