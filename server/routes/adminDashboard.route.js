import express from "express";
import User from "../models/User.js";
import Roadmap from "../models/Roadmap.js";
import Node from "../models/Node.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {

    // Basic Stats
    const users = await User.countDocuments();

    const roadmaps = await Roadmap.countDocuments({
      isActive: true
    });

    const nodes = await Node.countDocuments();

    // Disabled Roadmaps
    const disabledRoadmaps = await Roadmap.countDocuments({
      isActive: false
    });

    // Empty Roadmaps (roadmaps without nodes)
    const allRoadmaps = await Roadmap.find();

    let emptyRoadmaps = 0;

    for (const roadmap of allRoadmaps) {
      const nodeCount = await Node.countDocuments({
        roadmap: roadmap._id
      });

      if (nodeCount === 0) {
        emptyRoadmaps++;
      }
    }

    // Top Roadmap (most enrolled)
    const topRoadmap = await Roadmap
      .findOne()
      .sort({ enrolledCount: -1 });

    // Recent Activity

    const latestUsers = await User
      .find()
      .sort({ createdAt: -1 })
      .limit(5);

    const latestRoadmaps = await Roadmap
      .find()
      .sort({ createdAt: -1 })
      .limit(5);

    const activity = [
      ...latestUsers.map(user => ({
        action: "New user registered",
        target: user.name || user.email,
        time: user.createdAt
      })),
      ...latestRoadmaps.map(roadmap => ({
        action: "Roadmap created",
        target: roadmap.title,
        time: roadmap.createdAt
      }))
    ];

    res.json({
      stats: {
        users,
        roadmaps,
        nodes,
        disabledRoadmaps,
        emptyRoadmaps,
        topRoadmap: topRoadmap?.title || "None"
      },
      activity
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });

  }
});

export default router;