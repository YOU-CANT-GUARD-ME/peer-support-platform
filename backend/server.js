// ... all your imports remain unchanged
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

import Post from "./models/Post.js";
import Diary from "./models/Diary.js";
import SupportGroup from "./models/supportGroup.js";
import ChatMessage from "./models/ChatMessage.js";

import authRoutes from "./auth.js";
import createAuthVerifyRoutes from "./authVerify.js";
import nodemailer from "nodemailer";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ EMAIL VERIFICATION
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ⭐ HTTPS
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = {}; // { roomId: [nickname1, nickname2, ...] }

// ⭐ MIDDLEWARE
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ⭐ DATABASE
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// ⭐ AUTH ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/verify", createAuthVerifyRoutes(transporter)); // email verification

// ⭐ JWT Middleware
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

// CREATE POST
app.post("/api/posts", requireAuth, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      userId: req.userId,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD COMMENT
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { username, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (!post.comments) post.comments = [];

    post.comments.push({ username, content });
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// METOO
app.post("/api/posts/:id/metoo", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.meTooUsers.includes(req.userId)) {
      return res.status(400).json({ message: "Already MeToo" });
    }

    post.meTooUsers.push(req.userId);
    post.meTooCount = post.meTooUsers.length;
    await post.save();

    res.json({ message: "MeToo added", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE POST
app.delete("/api/posts/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Post.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });

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
    const diaries = await Diary.find({ userId: req.userId });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/diary", requireAuth, async (req, res) => {
  try {
    const entry = new Diary({ ...req.body, userId: req.userId });
    await entry.save();
    res.status(201).json(entry);
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

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Entry not found or unauthorized" });

    res.json({ message: "Diary entry deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ---------------------------
// SUPPORT GROUPS
// ---------------------------

// Get all groups
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await SupportGroup.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create group
app.post("/api/groups", requireAuth, async (req, res) => {
  try {
    const group = new SupportGroup({ ...req.body, creator: req.userId });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete group
app.delete("/api/groups/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await SupportGroup.findOneAndDelete({
      _id: req.params.id,
      creator: req.userId,
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Group not found or unauthorized" });

    // 멤버들의 currentGroupId 초기화
    await User.updateMany(
      { currentGroupId: deleted._id },
      { $set: { currentGroupId: null, groupNickname: "" } } // 수정
    );

    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join group (닉네임 설정 + 계정당 1개 그룹 제한)
app.post("/api/groups/join/:groupId", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { nickname } = req.body;

    if (!nickname?.trim()) // 수정: 빈 문자열 방지
      return res.status(400).json({ message: "Nickname is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.currentGroupId)
      return res.status(400).json({ message: "Already in a group" });

    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.length >= Number(group.limit))
      return res.status(400).json({ message: "Group is full" }); // 수정: 타입 안정화

    group.members.push({ userId: user._id, nickname });
    await group.save();

    user.currentGroupId = group._id;
    user.groupNickname = nickname;
    await user.save();

    res.json({ message: "Joined group", group });
  } catch (err) {
    console.error("Error in join group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/groups/:groupId
app.get("/api/groups/:groupId", requireAuth, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({
      _id: group._id,
      name: group.name,
      category: group.category,
      desc: group.desc,
      limit: group.limit,
      membersCount: group.members.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Leave group (탈퇴)
app.post("/api/groups/leave/:groupId", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter(
      (m) => m.userId.toString() !== user._id.toString()
    );
    await group.save();

    user.currentGroupId = null; // 안전하게 초기화
    user.groupNickname = "";
    await user.save();

    res.json({ message: "Left group", group });
  } catch (err) {
    console.error("Error in leave group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET my group
app.get("/api/groups/my-group", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // currentGroupId가 없으면 모든 그룹 반환
    if (!user.currentGroupId) {
      const groups = await SupportGroup.find();
      return res.json({ joinedGroup: null, groups });
    }

    // currentGroupId가 유효하지 않으면 null로 초기화 후 반환
    if (!mongoose.Types.ObjectId.isValid(user.currentGroupId)) {
      user.currentGroupId = null;
      await user.save();
      const groups = await SupportGroup.find();
      return res.json({ joinedGroup: null, groups });
    }

    const group = await SupportGroup.findById(user.currentGroupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({ joinedGroup: group });
  } catch (err) {
    console.error("Error in /api/groups/my-group:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/groups/:groupId/members - 멤버 리스트
app.get("/api/groups/:groupId/members", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await SupportGroup.findById(groupId)
      .populate("members.userId", "name email nickname");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// SOCKET.IO CHAT
// ---------------------------
const chatRooms = {};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", async ({ roomId, nickname }) => {
    socket.join(roomId);
    const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
    socket.emit(
      "chat-message-history",
      messages.map((m) => ({
        nickname: m.nickname,
        text: m.text,
        time: m.time || m.createdAt.toLocaleTimeString(),
        _id: m._id,
      }))
    );

    if (!chatRooms[roomId]) chatRooms[roomId] = [];
    if (!chatRooms[roomId].some((p) => p.id === socket.id))
      chatRooms[roomId].push({ id: socket.id, nickname });

    io.to(roomId).emit("room-users", chatRooms[roomId].map((p) => p.nickname));
    io.to(roomId).emit("user-joined", nickname);
  });

  socket.on("chat-message", async ({ roomId, message }) => {
    const msg = new ChatMessage({
      roomId,
      ...message,
      time: message.time || new Date().toLocaleTimeString(),
    });
    await msg.save();

    io.to(roomId).emit("chat-message", {
      nickname: msg.nickname,
      text: msg.text,
      time: msg.time,
      _id: msg._id,
    });
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    if (chatRooms[roomId]) {
      const participant = chatRooms[roomId].find((p) => p.id === socket.id);
      chatRooms[roomId] = chatRooms[roomId].filter((p) => p.id !== socket.id);
      io.to(roomId).emit(
        "room-users",
        chatRooms[roomId].map((p) => p.nickname)
      );
      if (participant) io.to(roomId).emit("user-left", participant.nickname);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (const roomId in chatRooms) {
      const participant = chatRooms[roomId].find((p) => p.id === socket.id);
      chatRooms[roomId] = chatRooms[roomId].filter((p) => p.id !== socket.id);
      io.to(roomId).emit(
        "room-users",
        chatRooms[roomId].map((p) => p.nickname)
      );
      if (participant) io.to(roomId).emit("user-left", participant.nickname);
    }
  });
});

// ⭐ SERVE FRONTEND
const frontendPath = path.join(__dirname, "../frontend/dist");
console.log("Serving frontend from:", frontendPath);

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ⭐ START SERVER
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
