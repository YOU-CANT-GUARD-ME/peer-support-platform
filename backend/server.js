import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import SupportGroup from "./models/supportGroup.js";
import authRoutes from "./auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err))

// --- Posts API ---
// --- Get all posts ---
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// --- Get one post ---
app.get("/api/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// --- Create post (NO category) ---
app.post("/api/posts", async (req, res) => {
  const { title, content } = req.body;

  const newPost = new Post({ title, content });
  await newPost.save();

  res.json(newPost);
});

// --- Add Comment ---
app.post("/api/posts/:id/comments", async (req, res) => {
  const { username, content } = req.body;
  const post = await Post.findById(req.params.id);

  post.comments.push({
    username,
    content,
    replies: []
  });

  await post.save();
  res.json(post);
});

// --- Add Reply ---
app.post("/api/posts/:postId/comments/:commentId/replies", async (req, res) => {
  const { username, content } = req.body;

  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.replies.push({ username, content });

  await post.save();
  res.json(post);
});

// --- Delete Reply ---
app.delete("/api/posts/:postId/comments/:commentId/replies/:replyId", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.replies.id(req.params.replyId).remove();
  await post.save();

  res.json(post);
});



// --- Support Groups API ---
app.get("/api/support-groups", async (req, res) => {
  const groups = await SupportGroup.find();
  res.json(groups);
});

app.post("/api/support-groups", async (req, res) => {
  const {topic, max, time} = req.body;
  const group = new supportGroup({topic, max, time});
  await group.save();
  res.json(group);
})

// Delete a post
app.delete("/api/posts/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

// Delete a comment
app.delete("/api/posts/:postId/comments/:commentId", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  post.comments.id(req.params.commentId).remove();
  await post.save();
  res.json(post);
});

// Delete a reply
app.delete("/api/posts/:postId/comments/:commentId/replies/:replyId", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);
  comment.replies.id(req.params.replyId).remove();
  await post.save();
  res.json(post);
});

// Edit a post
app.patch("/api/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
});

// Edit a comment
app.patch("/api/posts/:postId/comments/:commentId", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);
  comment.content = req.body.content || comment.content;
  await post.save();
  res.json(post);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
