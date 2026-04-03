import express from "express";
import { createRoadmap, getRoadmaps, cloneRoadmap, getUserRoadmaps } from "../controllers/roadmapController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, createRoadmap);
router.get("/", getRoadmaps);
router.post("/clone/:roadmapId", protect, cloneRoadmap);
router.get("/my", protect, getUserRoadmaps);

export default router;