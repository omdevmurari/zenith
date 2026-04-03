import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  date: {
    type: String,
  },

  xpEarned: {
    type: Number,
    default: 0,
  },

  nodesCompleted: {
    type: Number,
    default: 0,
  },

},
{ timestamps: true }
);

export default mongoose.model("Activity", activitySchema);