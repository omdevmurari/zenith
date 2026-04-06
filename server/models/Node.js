import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    xpValue: {
      type: Number,
      default: 50,
    },

    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
    },

    order: {
      type: Number,
    },

    position:{
 x:Number,
 y:Number
}
  },
  { timestamps: true }
);

export default mongoose.model("Node", nodeSchema);