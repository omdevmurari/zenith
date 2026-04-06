import express from "express";
import Roadmap from "../models/Roadmap.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();


// Create roadmap
router.post("/", protect, admin, async (req, res) => {
  try {
    const roadmap = new Roadmap(req.body);
    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all roadmaps
router.get("/", protect, admin, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {

  try {

    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found"
      });
    }

    // Toggle value
    roadmap.isActive = !roadmap.isActive;

    await roadmap.save();

    res.json(roadmap);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

export default router;