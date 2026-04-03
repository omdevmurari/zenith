import express from "express";
import { createNode, getNodes, updateNode, deleteNode } from "../controllers/nodeController.js";

const router = express.Router();

// Get nodes for a specific roadmap
router.get("/:roadmapId", getNodes);

// Create a new node
router.post("/", createNode);

// Update an existing node
router.put("/:id", updateNode);

// Delete a node
router.delete("/:id", deleteNode);

export default router;