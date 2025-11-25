import mongoose from "mongoose";

const DiarySchema = new mongoose.Schema(
    {
        emotion: { type: String, required: true },
        content: { type: String, required: true },
        theme: {
            id: String,
            src: String,
            label: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Diary", DiarySchema)