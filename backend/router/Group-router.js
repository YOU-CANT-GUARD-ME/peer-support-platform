// backend/routes/group-router.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import SupportGroup from "../models/supportGroup.js";
import authMiddleware from "../auth.js";

const router = express.Router();

// Join a group
router.post("/join", authMiddleware, async (req, res) => {
  const { groupId, nickname } = req.body;
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid group ID" });
  }

  try {
    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await User.findById(userId);

    if (nickname && nickname.trim() !== "") {
      user.nickname = nickname.trim();
    }

    // Remove user from old group
    if (user.currentGroupId) {
      const oldGroup = await SupportGroup.findById(user.currentGroupId);
      if (oldGroup) {
        oldGroup.members = oldGroup.members.filter(m => m.userId.toString() !== userId);
        await oldGroup.save();
      } else {
        user.currentGroupId = null;
      }
    }

    // Add user to new group
    if (!group.members.some(m => m.userId.toString() === userId)) {
      group.members.push({ userId, nickname: user.nickname });
      await group.save();
    }

    user.currentGroupId = groupId;
    await user.save();

    res.json({ message: "Joined group successfully", nickname: user.nickname });
  } catch (err) {
    console.error("JOIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single group
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

  try {
    const group = await SupportGroup.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({
      _id: group._id,
      name: group.name,
      category: group.category,
      desc: group.desc,
      memberCount: group.members.length,
    });
  } catch (err) {
    console.error("GROUP GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get members of a group
router.get("/:id/members", authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid group ID" });

  try {
    const group = await SupportGroup.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const members = await Promise.all(
      group.members.map(async (m) => {
        const user = await User.findById(m.userId);
        return { id: user._id, name: user.nickname || user.name };
      })
    );

    res.json(members);
  } catch (err) {
    console.error("MEMBER LIST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Leave a group
router.post("/leave", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.currentGroupId) return res.status(400).json({ message: "User not in a group" });

    const group = await SupportGroup.findById(user.currentGroupId);
    if (group) {
      group.members = group.members.filter(m => m.userId.toString() !== req.userId);
      await group.save();
    }

    user.currentGroupId = null;
    await user.save();

    res.json({ message: "Left group successfully" });
  } catch (err) {
    console.error("LEAVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user's group
router.get("/my-group", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.currentGroupId) return res.json({ hasGroup: false });

    const group = await SupportGroup.findById(user.currentGroupId);
    if (!group) {
      user.currentGroupId = null;
      await user.save();
      return res.json({ hasGroup: false });
    }

    res.json({
      hasGroup: true,
      groupId: group._id,
      name: group.name,
      category: group.category,
      desc: group.desc,
      membersCount: group.members.length,
    });
  } catch (err) {
    console.error("MY GROUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
