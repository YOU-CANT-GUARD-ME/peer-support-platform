import mongoose from "mongoose";

// ---------------------------
// Comment Schema
// ---------------------------
const commentSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ---------------------------
// Post Schema
// ---------------------------
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  nickname: { type: String, required: true },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

// ---------------------------
// Member Schema
// ---------------------------
const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
});

// ---------------------------
// Support Group Schema
// ---------------------------
const supportGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    limit: { type: Number, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },

    // NEW: creator of the group
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Members array
    members: [memberSchema],

    // Posts in this group
    posts: [postSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SupportGroup", supportGroupSchema);
