import mongoose from "mongoose";

const supportGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    limit: { type: Number, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },
    members: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("SupportGroup", supportGroupSchema);