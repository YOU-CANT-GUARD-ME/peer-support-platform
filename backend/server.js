import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Post from "./models/Post.js";
import SupportGroup from "./models/supportGroup.js";
import authRoutes from "./auth.js";
import Diary from "./models/Diary.js";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// CORS SETUP
// --------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://digitechrecoverycentor.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

// --------------------------------------------------
// MongoDB
// --------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

// Posts routes
// Create Post
app.post("/api/posts", async (req, res) => {
  const { title, content, userId } = req.body;
  try {
    const newPost = new Post({ title, content, author: userId });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: "Post creation failed", error: err.message });
  }
});

// Delete Post
app.delete("/api/posts/:id", async (req, res) => {
  const { userId } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== userId)
    return res.status(403).json({ message: "Not authorized" });
  
  await post.deleteOne();
  res.json({ message: "Post deleted" });
});

// Me Too
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

// Add Comment
app.post("/api/posts/:id/comments", async (req, res) => {
  const { username, content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ username, content, replies: [] });
  await post.save();

  res.json(post);
});



// Support Group routes
app.get("/api/groups", async (req, res) => {
  const groups = await SupportGroup.find().sort({ createdAt: -1 });
  res.json(groups);
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

app.get("/api/groups/my", async (req, res) => {
  const groups = await SupportGroup.find();
  res.json(groups);
});

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

// --------------------------------------------------
// SOCKET.IO (VOICE CHAT)
// --------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // roomId => Map(socket.id => nickname)

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", ({ roomId, nickname }) => {
    socket.join(roomId);
    socket.nickname = nickname;

    if (!rooms[roomId]) rooms[roomId] = new Map();
    rooms[roomId].set(socket.id, nickname);

    // Send current users to the new user
    const users = Array.from(rooms[roomId]).map(([id, name]) => ({
      id,
      nickname: name,
    }));
    socket.emit("room-users", users);

    // Notify others
    socket.to(roomId).emit("user-joined", { id: socket.id, nickname });
  });

  socket.on("leave-room", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      socket.to(roomId).emit("user-left", { id: socket.id });
    }
    socket.leave(roomId);
  });

  socket.on("offer", ({ to, offer }) =>
    io.to(to).emit("offer", { from: socket.id, offer })
  );

  socket.on("answer", ({ to, answer }) =>
    io.to(to).emit("answer", { from: socket.id, answer })
  );

  socket.on("ice-candidate", ({ to, candidate }) =>
    io.to(to).emit("ice-candidate", { from: socket.id, candidate })
  );

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (rooms[roomId]) {
        rooms[roomId].delete(socket.id);
        socket.to(roomId).emit("user-left", { id: socket.id });
      }
    }
  });
});
