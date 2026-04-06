import express from "express";
import Node from "../models/Node.js";

const router = express.Router();

router.patch("/positions", async (req, res) => {

  try {

    const updates = req.body;

    for (const node of updates) {

      await Node.findByIdAndUpdate(
        node._id,
        {
          position: {
            x: node.x,
            y: node.y
          }
        }
      );

    }

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to update positions"
    });

  }

});

export default router;