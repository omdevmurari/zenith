import express from "express";
import UserRoadmap from "../models/UserRoadmap.js";
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

res.json(roadmaps);

} catch (error) {
res.status(500).json({ message: "Server error" });
}
});

export default router;