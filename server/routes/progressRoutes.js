import express from "express";
import { completeNode, getProgress, getDashboardStats } from "../controllers/progressController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/complete/:nodeId", protect, completeNode);
router.get("/", protect, getProgress);
router.get("/stats", protect, getDashboardStats);

export default router;