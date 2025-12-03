import express from "express";
import SupportGroup from "../models/supportGroup.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// --- Get all groups ---
router.get("/", requireAuth, async (req, res) => {
  try {
    const groups = await SupportGroup.find();
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Create a new group ---
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, category, desc, limit } = req.body;
    if (!name || !category || !desc || !limit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch user to get their nickname
    const user = await User.findById(req.userId);

    const newGroup = new SupportGroup({
      name,
      category,
      desc,
      limit,
      creator: req.userId,
      members: [{ userId: req.userId, nickname: user.nickname || "Anonymous" }],
    });

    await newGroup.save();

    // Update user's current group
    user.currentGroupId = newGroup._id;
    await user.save();

    res.status(201).json(newGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// --- Get my group info ---
router.get("/my-group", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.currentGroupId) return res.status(404).json({ message: "No group joined" });

    const group = await SupportGroup.findById(user.currentGroupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Get group by ID ---
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Get members of a group ---
router.get("/:id/members", requireAuth, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const memberList = group.members.map((m) => ({ id: m.userId, name: m.nickname }));
    res.json(memberList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Join a group ---
router.post("/join", requireAuth, async (req, res) => {
  try {
    const { groupId, nickname } = req.body;
    if (!groupId || !nickname) return res.status(400).json({ message: "GroupId and nickname required" });

    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!group.members.some((m) => m.userId.toString() === req.userId)) {
      group.members.push({ userId: req.userId, nickname });
      await group.save();
    }

    user.nickname = nickname;
    user.currentGroupId = group._id;
    await user.save();

    res.json({ message: "Joined group", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Leave a group ---
router.post("/leave", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.currentGroupId) return res.status(400).json({ message: "Not in any group" });

    const group = await SupportGroup.findById(user.currentGroupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter((m) => m.userId.toString() !== req.userId);
    await group.save();

    user.currentGroupId = null;
    await user.save();

    res.json({ message: "Left group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
