import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "admin", "owner"],
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
        ref: "Node",
      },
    ],

    xp: {
      type: Number,
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastActive: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDisabled: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },

    otpPurpose: {
      type: String,
      enum: ["register", "login", "forgot_password", "change_password", null],
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
