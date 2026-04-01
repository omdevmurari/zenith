const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const protect = require("./middleware/authMiddleware");
const admin = require("./middleware/adminMiddleware");
const roadmapRoutes = require("./routes/roadmapRoutes");
const nodeRoutes = require("./routes/nodeRoutes");
const progressRoutes = require("./routes/progressRoutes");
const activityRoutes = require("./routes/activityRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

dotenv.config();

const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Zenith API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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