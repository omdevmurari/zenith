const express = require("express");
const router = express.Router();

const { completeNode } = require("../controllers/progressController");

const { getProgress } = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

const { getDashboardStats } = require("../controllers/progressController");

router.post("/complete/:nodeId", protect, completeNode);
router.get("/", protect, getProgress);
router.get("/stats", protect, getDashboardStats);

module.exports = router;