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

    // Save nickname
    if (nickname && nickname.trim() !== "") {
      user.nickname = nickname.trim();
    }

    // Remove from previous group
    if (user.currentGroupId && user.currentGroupId !== groupId) {
      const oldGroup = await SupportGroup.findById(user.currentGroupId);
      if (oldGroup) {
        oldGroup.members = oldGroup.members.filter(
          (m) => m.userId.toString() !== userId
        );
        await oldGroup.save();
      }
    }

    // Add to new group if not already inside
    if (!group.members.some((m) => m.userId.toString() === userId)) {
      group.members.push({
        userId,
        nickname: user.nickname
      });
      await group.save();
    }

    // Save user's active group
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
 * GET /api/groups/:id
 * - Returns basic group info (name, category, desc, member count)
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({
      _id: group._id,
      name: group.name,
      category: group.category,
      desc: group.desc,
      memberCount: group.members.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/groups/:id/members
 * - Returns list of users in a group
 */
router.get("/:id/members", authMiddleware, async (req, res) => {
  try {
    const group = await SupportGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const members = await Promise.all(
      group.members.map(async (m) => {
        const user = await User.findById(m.userId);
        return {
          id: user._id,
          name: user.nickname || user.name,
          profile: "" // 프론트에서 기본 이미지 사용
        };
      })
    );

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/groups/leave
 * - Removes user from group and clears currentGroupId
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

// GET /api/groups/my-group
router.get("/my-group", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.currentGroupId) {
      return res.json({ hasGroup: false });
    }

    const group = await SupportGroup.findById(user.currentGroupId);
    if (!group) {
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;