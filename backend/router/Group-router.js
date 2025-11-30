// POST /api/groups/join
import express from "express";
import User from "../models/User.js";
// import supportGroup from "../models/supportGroup.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/join", authMiddleware, async (req, res) => {
  const { groupId, nickname } = req.body;
  const userId = req.userId;

  try {
    // 1️⃣ 그룹에 참가자 등록
    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some(m => m.userId.toString() === userId)) {
      group.members.push({ userId, nickname });
      await group.save();
    }

    // 2️⃣ 유저 마이그룹에 추가
    const user = await User.findById(userId);
    if (!user.myGroups.some(g => g.toString() === groupId)) {
      user.myGroups.push(groupId);
      await user.save();
    }

    res.json({ message: "Joined group successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
