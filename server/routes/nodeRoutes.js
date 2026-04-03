import express from "express";
import { createNode, getNodes } from "../controllers/nodeController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, createNode);
router.get("/:roadmapId", getNodes);

export default router;