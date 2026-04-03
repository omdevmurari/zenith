import mongoose from "mongoose";

const userRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roadmap"
  },
  progress: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("UserRoadmap", userRoadmapSchema);