// -----------------------------
// 기본 라이브러리
// -----------------------------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

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

// -----------------------------
// HTTP 서버 + Socket.io 서버 생성
// -----------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // 필요하면 React URL로 제한
    methods: ["GET", "POST"]
  }
});

// 방 목록 저장
// rooms: { "group-xxx": [ { socketId, name, userId }, ... ] }
const rooms = {};

io.on("connection", (socket) => {
  console.log("🔥 WebRTC Client Connected:", socket.id);

  // 1️⃣ 방 참가
  socket.on("join_room", ({ roomId, user }) => {
    socket.join(roomId);

    // 유저 정보에 소켓ID 추가
    user.socketId = socket.id;

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(user);

    console.log(`🔊 ${user.name} joined ${roomId}`);

    // 모든 사람에게 최신 목록 전송
    io.to(roomId).emit("update_users", rooms[roomId]);

    // 기존 사용자에게 새 유저 도착 알림
    socket.to(roomId).emit("user_joined", user);
  });

  // 2️⃣ OFFER 전달
  socket.on("offer", ({ offer, from, to }) => {
    io.to(to).emit("offer", { offer, from });
  });

  // 3️⃣ ANSWER 전달
  socket.on("answer", ({ answer, from, to }) => {
    io.to(to).emit("answer", { answer, from });
  });

  // 4️⃣ ICE 전달
  socket.on("ice", ({ ice, from, to }) => {
    io.to(to).emit("ice", { ice, from });
  });

  // 5️⃣ 방 나가기 (클라이언트에서 leave 버튼 누를 때)
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);

    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((u) => u.socketId !== socket.id);
      io.to(roomId).emit("update_users", rooms[roomId]);
      io.to(roomId).emit("user_left", socket.id);
    }
    console.log(`🚪 user left room: ${socket.id}`);
  });

  // 6️⃣ 유저 브라우저 닫힘/새로고침
  socket.on("disconnect", () => {
    console.log("❌ WebRTC Client Disconnected:", socket.id);

    for (const roomId in rooms) {
      const list = rooms[roomId];
      const idx = list.findIndex((u) => u.socketId === socket.id);

      if (idx !== -1) {
        list.splice(idx, 1);
        io.to(roomId).emit("update_users", list);
        io.to(roomId).emit("user_left", socket.id);
      }
    }
  });
});

// -----------------------------
// MongoDB
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


// -----------------------------
// REST API (그대로 유지)
// -----------------------------

// Auth Routes
app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| COMMUNITY POSTS API
|--------------------------------------------------------------------------
*/
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

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

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
});

app.post("/api/posts/:id/comments", async (req, res) => {
  const { username, content } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ username, content, replies: [] });

  await post.save();
  res.json(post);
});

// Me Too
app.post("/api/posts/:id/me-too", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.meTooUsers.includes(userId)) {
      return res.status(400).json({ error: "User already reacted" });
    }

    post.meTooUsers.push(userId);
    post.meTooCount = post.meTooUsers.length;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Me Too failed", details: err.message });
  }
});

/*
|--------------------------------------------------------------------------
| SUPPORT GROUP
|--------------------------------------------------------------------------
*/
app.get("/api/groups", async (req, res) => {
  const groups = await SupportGroup.find().sort({ createdAt: -1 });
  res.json(groups);
});

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
| DIARY
|--------------------------------------------------------------------------
*/
app.get("/api/diary", async (req, res) => {
  const entries = await Diary.find().sort({ createdAt: -1 });
  res.json(entries);
});

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

app.delete("/api/diary/:id", async (req, res) => {
  await Diary.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
