import express from "express";
import {
  completeNode,
  getDashboardStats,
  getProgress
} from "../controllers/progressController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.post("/complete/:nodeId", protect, completeNode);
router.post("/complete", protect, completeNode);
router.get("/", protect, getProgress);

export default router;
