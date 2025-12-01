import express from "express";
import User from "../models/User.js";
import SupportGroup from "../models/supportGroup.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/groups/join
 * - User can join only ONE group
 * - Saves nickname to user
 * - Adds user to group.members
 */
router.post("/join", authMiddleware, async (req, res) => {
  const { groupId, nickname } = req.body;
  const userId = req.userId;

  try {
    const group = await SupportGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await User.findById(userId);

    // ⭐ Save nickname permanently
    if (nickname && nickname.trim() !== "") {
      user.nickname = nickname.trim();
    }

    // ⭐ Remove user from previous group
    if (user.currentGroupId && user.currentGroupId !== groupId) {
      const oldGroup = await SupportGroup.findById(user.currentGroupId);
      if (oldGroup) {
        oldGroup.members = oldGroup.members.filter(
          (m) => m.userId.toString() !== userId
        );
        await oldGroup.save();
      }
    }

    // ⭐ Add user to the new group if not already inside
    if (!group.members.some((m) => m.userId.toString() === userId)) {
      group.members.push({
        userId,
        nickname: user.nickname
      });
      await group.save();
    }

    // ⭐ Save user's active group
    user.currentGroupId = groupId;
    await user.save();

    res.json({
      message: "Joined group successfully",
      nickname: user.nickname
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/groups/:id/members
 * Returns list of users in a group
 */
router.get("/:id/members", authMiddleware, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id)
      .populate("members.userId", "name email nickname");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group.members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/groups/leave
 * Removes user from group and clears currentGroupId
 */
router.post("/leave", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user.currentGroupId)
      return res.status(400).json({ message: "User not in a group" });

    const group = await SupportGroup.findById(user.currentGroupId);

    if (group) {
      group.members = group.members.filter(
        (m) => m.userId.toString() !== userId
      );
      await group.save();
    }

    user.currentGroupId = null;
    await user.save();

    res.json({ message: "Left group successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
