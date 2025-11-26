import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  nickname: { type: String, required: true },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

const supportGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    limit: { type: Number, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },
    members: { type: Number, default: 1 },
    posts: [postSchema], // added for group posts
  },
  { timestamps: true }
);

export default mongoose.model("SupportGroup", supportGroupSchema);
