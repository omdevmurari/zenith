const express = require("express");
const router = express.Router();

const { completeNode } = require("../controllers/progressController");

const { getProgress } = require("../controllers/progressController");

const protect = require("../middleware/authMiddleware");

router.post("/complete/:nodeId", protect, completeNode);
router.get("/", protect, getProgress);

module.exports = router;