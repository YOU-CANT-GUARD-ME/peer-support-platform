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
    // ⭐ 그룹 생성자 (삭제 가능 여부 확인용)
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: { type: String, required: true },
    limit: { type: Number, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },

    // ⭐ 현재 그룹 인원수
    members: { type: Number, default: 1 },

    // ⭐ 그룹 게시글
    posts: [postSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SupportGroup", supportGroupSchema);
