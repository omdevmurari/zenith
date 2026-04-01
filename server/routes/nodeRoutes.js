const express = require("express");
const router = express.Router();

const { createNode, getNodes } = require("../controllers/nodeController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post("/", protect, admin, createNode);
router.get("/:roadmapId", getNodes);

module.exports = router;