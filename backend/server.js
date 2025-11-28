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
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post("/api/posts", async (req, res) => {
  const { title, content } = req.body;
  const newPost = new Post({ title, content });
  await newPost.save();
  res.json(newPost);
});

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

// --------------------------------------------------
// Serve Frontend (Optional)
// --------------------------------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
