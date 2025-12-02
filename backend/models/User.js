import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  // 로그인/계정용 닉네임
  nickname: { type: String, default: "" },

  // 현재 가입한 그룹 ID (계정당 1개 그룹만) → ObjectId 참조
  currentGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportGroup",
    default: null,
  },

  // 그룹 내에서 사용할 닉네임
  groupNickname: { type: String, default: "" },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
