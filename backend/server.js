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

app.get("/api/groups/my", async (req, res) => {
  const groups = await SupportGroup.find(); // or filter by user later
  res.json(groups);
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

// ------------------------------
// ⭐⭐ WebRTC 음성채팅 socket.io 추가 ⭐⭐
// ------------------------------
import http from "http";
import { Server } from "socket.io";

// 기존 app, mongoose 연결 코드 그대로

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // 프론트엔드 주소로 변경 가능
    methods: ["GET", "POST"],
  },
});

// -----------------------------
// 음성채팅용 Socket.IO
// -----------------------------
const rooms = {}; // roomId -> Set(socket.id)

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // 방 참가
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = new Set();
    rooms[roomId].add(socket.id);

    // 방에 있는 유저 목록 보내기
    const users = Array.from(rooms[roomId]).filter((id) => id !== socket.id);
    socket.emit("room-users", users);

    // 다른 유저에게 새로운 참가자 알림
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // 방 떠남
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    if (rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      socket.to(roomId).emit("user-left", socket.id);
    }
  });

  // Offer
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  // Answer
  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  // ICE Candidate
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // 연결 끊김
  socket.on("disconnecting", () => {
    const socketRooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    socketRooms.forEach((roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].delete(socket.id);
        socket.to(roomId).emit("user-left", socket.id);
      }
    });
  });
});

// -----------------------------
// 서버 시작
// -----------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
