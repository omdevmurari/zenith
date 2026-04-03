import express from "express";
import UserRoadmap from "../models/UserRoadmap.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Start Course
router.post("/start", auth, async (req, res) => {
  try {

    const { roadmapId } = req.body;

    const exists = await UserRoadmap.findOne({ userId: req.user.id, roadmapId });

    const roadmaps = await UserRoadmap.find({
  user: req.user.id
}).populate("roadmapId");

    if (exists) {
      return res.json(exists);
    }

const roadmap = new UserRoadmap({
 user: req.user._id,
 roadmapId: roadmapId,
 progress: 0
});

await roadmap.save();

res.json(roadmap);

    await newRoadmap.save();

    res.json(newRoadmap);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get My Roadmaps
router.get("/my", auth, async (req, res) => {

  const roadmaps = await UserRoadmap.find({
    userId: req.user.id
  }).populate("roadmapId");

  res.json(roadmaps);

  console.log(roadmaps);
});

export default router;