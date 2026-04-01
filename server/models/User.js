const mongoose = require("mongoose");

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

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);