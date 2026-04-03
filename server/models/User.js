import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    clonedRoadmaps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
      },
    ],
    completedNodes: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node"
        }
    ],

      xp: {
        type: Number,
        default: 0
    },
    streak: {
      type: Number,
      default: 0
    },

    longestStreak: {
      type: Number,
      default: 0
    },

    lastActive: {
      type: String
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);