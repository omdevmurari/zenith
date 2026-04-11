import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

roadmap: {
type: mongoose.Schema.Types.ObjectId,
ref: "Roadmap",
required: true
},

node: {
type: mongoose.Schema.Types.ObjectId,
ref: "Node",
required: true
},

completed: {
type: Boolean,
default: false
}

},
{ timestamps: true }
);

export default mongoose.model("Progress", progressSchema);