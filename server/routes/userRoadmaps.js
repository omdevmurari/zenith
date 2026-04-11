import express from "express";
import UserRoadmap from "../models/UserRoadmap.js";
import User from "../models/User.js";
import Node from "../models/Node.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// START COURSE
router.post("/start", auth, async (req, res) => {
  try {

    const { roadmapId } = req.body;

    if (!roadmapId) {
      return res.status(400).json({
        message: "roadmapId required"
      });
    }

    // Check existing
    const exists = await UserRoadmap.findOne({
      userId: req.user.id,
      roadmapId
    });

    if (exists) {
      return res.json(exists);
    }

    const newUserRoadmap = new UserRoadmap({
      userId: req.user.id,
      roadmapId,
      progress: 0
    });

    await newUserRoadmap.save();

    res.json(newUserRoadmap);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER ROADMAPS
router.get("/my", auth, async (req, res) => {
  try {

    const roadmaps = await UserRoadmap
      .find({ userId: req.user.id })
      .populate("roadmapId");

    // Calculate progress for each roadmap
    // Populate completedNodes with their roadmap info
    const user = await User.findById(req.user.id).populate({
      path: "completedNodes",
      model: "Node"
    });

    const roadmapsWithProgress = await Promise.all(
      roadmaps.map(async (userRoadmap) => {
        const roadmapId = userRoadmap.roadmapId._id;

        // Get total nodes for this roadmap
        const totalNodes = await Node.countDocuments({ roadmap: roadmapId });

        // Filter completed nodes that belong to this roadmap
        const completedInThisRoadmap = user.completedNodes.filter((node) => {
          return node.roadmap?.toString() === roadmapId.toString();
        }).length;

        const progress = totalNodes > 0
          ? Math.round((completedInThisRoadmap / totalNodes) * 100)
          : 0;

        return {
          ...userRoadmap.toObject(),
          progress
        };
      })
    );

    res.json(roadmapsWithProgress);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;