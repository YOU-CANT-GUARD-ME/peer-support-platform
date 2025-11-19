import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import Mentor from "./models/Mentor.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// --- Posts API ---
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.get("/api/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

app.post("/api/posts", async (req, res) => {
  const { title, content, category } = req.body;
  const newPost = new Post({ title, content, category });
  await newPost.save();
  res.json(newPost);
});

// --- Mentors API ---
app.get("/api/mentors", async (req, res) => {
  const mentors = await Mentor.find();
  res.json(mentors);
});

// --- Support Groups API (static for now) ---
app.get("/api/support-groups", (req, res) => {
  const groups = [
    { topic: 'Anxiety Room', members: 5, max: 10, time: '7 PM' },
    { topic: 'School Stress', members: 8, max: 12, time: '8 PM' },
    { topic: 'Confidence Boost', members: 3, max: 10, time: '9 PM' },
  ];
  res.json(groups);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
