import mongoose from "mongoose";

const supportGroupSchema = new mongoose.Schema({
    topic: String,
    members: {type: Number, default: 0},
    max: Number,
    time: String
});

export default mongoose.model("SupportGroup", supportGroupSchema);