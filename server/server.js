import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import protect from "./middleware/authMiddleware.js";
import admin from "./middleware/adminMiddleware.js";

import roadmapRoutes from "./routes/roadmapRoutes.js";
import nodeRoutes from "./routes/nodeRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import userRoadmapRoutes from "./routes/userRoadmaps.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoadmaps from "./routes/adminRoadmaps.js";

import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Zenith API Running 🚀");
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected Route Accessed",
    user: req.user
  });
});

app.get("/api/admin", protect, admin, (req, res) => {
  res.json({
    message: "Admin Access Granted",
    user: req.user
  });
});

app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user-roadmaps", userRoadmapRoutes);
app.use("/api/admin-roadmaps", adminRoadmaps);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});