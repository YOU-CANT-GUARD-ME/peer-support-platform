import mongoose from "mongoose";

const DiarySchema = new mongoose.Schema(
  {
    emotion: { type: String, required: true },
    content: { type: String, required: true },
    themeId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Diary", DiarySchema);
