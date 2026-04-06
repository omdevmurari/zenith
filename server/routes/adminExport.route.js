import express from "express";
import User from "../models/User.js";
import Roadmap from "../models/Roadmap.js";
import Node from "../models/Node.js";

const router = express.Router();

router.get("/export", async (req, res) => {

  try {

    const users = await User.find();
    const roadmaps = await Roadmap.find();
    const nodes = await Node.find();

    const data = {
      exportedAt: new Date(),
      users,
      roadmaps,
      nodes
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=zenith-export.json"
    );

    res.setHeader(
      "Content-Type",
      "application/json"
    );

    res.send(JSON.stringify(data, null, 2));

  } catch (error) {

    res.status(500).json({
      message: "Export failed"
    });

  }

});

export default router;