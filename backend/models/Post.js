import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: String,
    content: String,

    // ⭐ REQUIRED FIELD — missing before
    userId: {
      type: String,
      required: true,
    },

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
        type: String, // user IDs stored as strings
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
