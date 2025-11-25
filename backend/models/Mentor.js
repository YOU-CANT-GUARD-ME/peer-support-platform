import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  experience: { type: String, required: true },
  expertise: { type: String, default: "General" },
});

export default mongoose.model("Mentor", mentorSchema);