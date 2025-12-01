// models/ChatMessage.js
import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  roomId: String,
  nickname: String,
  text: String,
  time: String, // "HH:MM:SS"
}, { timestamps: true });

export default mongoose.model("ChatMessage", ChatMessageSchema);
