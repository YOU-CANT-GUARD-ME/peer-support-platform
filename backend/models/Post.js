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
    ],

    // How many "Me Too" clicks
    meTooCount: {
      type: Number,
      default: 0,
    },

    // The actual users who clicked Me Too
    meTooUsers: [
      {
        type: String, // store a userId or username
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
