import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  name: String,
  experience: String,
});

export default mongoose.model("Mentor", mentorSchema);
