import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
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
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);