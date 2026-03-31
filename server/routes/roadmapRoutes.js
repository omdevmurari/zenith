const express = require("express");
const router = express.Router();

const {
  createRoadmap,
  getRoadmaps,
} = require("../controllers/roadmapController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, admin, createRoadmap);
router.get("/", getRoadmaps);

module.exports = router;