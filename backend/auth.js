import express from "express";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ----------------- 이메일 도메인 제한 -----------------
function isAllowedDomain(email) {
return email.endsWith("@sdh.hs.kr");
}

// ----------------- SIGNUP -----------------
router.post("/signup", async (req, res) => {
const { name, email, password } = req.body;

// 이메일 도메인 체크
if (!isAllowedDomain(email)) {
return res.status(400).json({
message: "학교 이메일(@sdh.hs.kr)만 회원가입 가능합니다.",
});
}

// 이미 가입된 이메일 체크
const exists = await User.findOne({ email });
if (exists) {
return res.status(400).json({ message: "이미 가입된 이메일입니다." });
}

try {
// 비밀번호 해싱
const hashed = await bcrypt.hash(password, 10);

// 사용자 생성
const user = await User.create({
  name,
  email,
  password: hashed,
});

res.status(201).json({ message: "회원가입 완료!", user: { id: user._id, name: user.name, email: user.email } });

} catch (err) {
console.error(err);
res.status(500).json({ message: "회원가입 실패", error: err.message });
}
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

const user = await User.findOne({ email });
if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

const valid = await bcrypt.compare(password, user.password);
if (!valid) return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });

const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({
  message: "로그인 성공",
  user: { id: user._id, name: user.name, email: user.email },
  token,
});

} catch (err) {
res.status(500).json({ message: "서버 오류", error: err.message });
}
});

export default router;
