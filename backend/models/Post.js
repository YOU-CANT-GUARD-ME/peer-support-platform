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
            content: String,
          },
        ],
      },
    ],

    meTooCount: {
      type: Number,
      default: 0,
    },

    meTooUsers: [
      {
        type: String, // <-- FIXED: can store simple user strings
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);  