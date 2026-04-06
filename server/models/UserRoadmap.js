import mongoose from "mongoose";

const userRoadmapSchema = new mongoose.Schema({
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},
roadmapId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Roadmap",
required: true
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

export default mongoose.model(
"UserRoadmap",
userRoadmapSchema
);
