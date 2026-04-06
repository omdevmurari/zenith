import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    category: {
      type: String,
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    color: {
      type: String,
      default: "#34d399"
    },

    layoutType: {
      type: String,
      default: "auto"
    },

    totalXp: {
      type: Number,
      default: 0,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    nodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node",
      },
    ],

    published: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);