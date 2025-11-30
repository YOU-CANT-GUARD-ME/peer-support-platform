import express from "express";
import Diary from "../models/Diary.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 다이어리 조회
router.get("/", authMiddleware, async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ message: "Failed to load diary" });
  }
});

// 다이어리 작성
router.post("/", authMiddleware, async (req, res) => {
  const { emotion, content, themeId } = req.body;

  try {
    const newDiary = await Diary.create({
      emotion,
      content,
      themeId,
      userId: req.user._id, // 🔥 사용자 연결
    });

    res.status(201).json(newDiary);
  } catch (err) {
    res.status(500).json({ message: "Failed to save diary" });
  }
});

export default router;
