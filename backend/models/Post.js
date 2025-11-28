import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 작성자

    comments: [
      {
        username: String,
        content: String,
        replies: [
          {
            username: String,
            content: String
          }
        ]
      }
    ],

    meTooCount: { type: Number, default: 0 },
    meTooUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
