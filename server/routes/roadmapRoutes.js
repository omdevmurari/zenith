const express = require("express");
const router = express.Router();
const { cloneRoadmap } = require("../controllers/roadmapController");
const { getUserRoadmaps } = require("../controllers/roadmapController");

const {
  createRoadmap,
  getRoadmaps,
} = require("../controllers/roadmapController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, admin, createRoadmap);
router.get("/", getRoadmaps);
router.post("/clone/:roadmapId", protect, cloneRoadmap);
router.get("/my", protect, getUserRoadmaps);

module.exports = router;