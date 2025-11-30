import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import Post from "./models/Post.js";
import Diary from "./models/Diary.js";
import SupportGroup from "./models/supportGroup.js";

import authRoutes from "./auth.js";
import createAuthVerifyRoutes from "./authVerify.js";
import nodemailer from "nodemailer";

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

//
// ⭐⭐⭐ REAL API ENDPOINTS ⭐⭐⭐
//

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

app.post("/api/posts", requireAuth, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// MeToo
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

// ⭐ DELETE POST
app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
        const deleted = await Post.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!deleted)
            return res.status(404).json({ message: "Post not found or unauthorized" });

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

// ⭐ DELETE DIARY ENTRY
app.delete("/api/diary/:id", requireAuth, async (req, res) => {
    try {
        const deleted = await Diary.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!deleted)
            return res.status(404).json({ message: "Entry not found or unauthorized" });

        res.json({ message: "Diary entry deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ---------------------------
// SUPPORT GROUPS
// ---------------------------
app.get("/api/groups", async (req, res) => {
    try {
        const groups = await SupportGroup.find();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/groups", requireAuth, async (req, res) => {
    try {
        const group = new SupportGroup(req.body);
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ⭐ DELETE GROUP
app.delete("/api/groups/:id", requireAuth, async (req, res) => {
    try {
        const deleted = await SupportGroup.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!deleted)
            return res.status(404).json({ message: "Group not found or unauthorized" });

        res.json({ message: "Group deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//
// ⭐⭐⭐ FRONTEND SERVING ⭐⭐⭐
//
const frontendPath = path.join(__dirname, "../frontend/dist");
console.log("Serving frontend from:", frontendPath);

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ⭐ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
