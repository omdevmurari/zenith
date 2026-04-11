import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

const getUserId = (req) => req.user?.id || req.user?._id;

router.get("/", protect, admin, async (req, res) => {
  try {
    const requesterRole = req.user?.role;
    const requesterId = getUserId(req);

    const query =
      requesterRole === "owner"
        ? {}
        : {
            role: "student",
            _id: { $ne: requesterId },
          };

    const users = await User.find(query)
      .select(
        "name email role xp streak longestStreak isVerified isDisabled completedNodes clonedRoadmaps lastActive createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      users,
      currentRole: requesterRole,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.patch("/:id/make-admin", protect, admin, async (req, res) => {
  try {
    if (req.user?.role !== "owner") {
      return res.status(403).json({
        message: "Only owners can change user roles.",
      });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (targetUser.role === "owner") {
      return res.status(400).json({
        message: "Owner accounts cannot be modified from this page.",
      });
    }

    targetUser.role = "admin";
    await targetUser.save();

    res.json({
      message: `${targetUser.name || targetUser.email} is now an admin.`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        xp: targetUser.xp,
        streak: targetUser.streak,
        longestStreak: targetUser.longestStreak,
        isVerified: targetUser.isVerified,
        isDisabled: targetUser.isDisabled,
        completedNodes: targetUser.completedNodes,
        clonedRoadmaps: targetUser.clonedRoadmaps,
        lastActive: targetUser.lastActive,
        createdAt: targetUser.createdAt,
        updatedAt: targetUser.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user role." });
  }
});

router.patch("/:id/remove-admin", protect, admin, async (req, res) => {
  try {
    if (req.user?.role !== "owner") {
      return res.status(403).json({
        message: "Only owners can change user roles.",
      });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (targetUser.role !== "admin") {
      return res.status(400).json({
        message: "Only admin accounts can be demoted.",
      });
    }

    targetUser.role = "student";
    await targetUser.save();

    res.json({
      message: `${targetUser.name || targetUser.email} is now a student.`,
      user: targetUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user role." });
  }
});

router.patch("/:id/toggle-disable", protect, admin, async (req, res) => {
  try {
    if (req.user?.role !== "owner" && req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only admins and owners can disable accounts.",
      });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (targetUser.role !== "student") {
      return res.status(400).json({
        message: "Only student accounts can be disabled from this page.",
      });
    }

    targetUser.isDisabled = !targetUser.isDisabled;
    await targetUser.save();

    res.json({
      message: `${targetUser.name || targetUser.email} has been ${targetUser.isDisabled ? "disabled" : "enabled"}.`,
      user: targetUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update account state." });
  }
});

export default router;
