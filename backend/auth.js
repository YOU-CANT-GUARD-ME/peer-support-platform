// auth.js
import express from "express";
import User from "./models/User.js";
import EmailVerification from "./models/EmailVerification.js";
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

  console.log("SIGNUP BODY:", req.body);

  // 이메일 도메인 체크
  if (!isAllowedDomain(email)) {
    return res.status(400).json({
      message: "학교 이메일(@sdh.hs.kr)만 회원가입 가능합니다.",
    });
  }

  // 이메일 인증 여부 확인
  const verifyRecord = await EmailVerification.findOne({ email });
  if (!verifyRecord || !verifyRecord.verified) {
    return res.status(400).json({ message: "이메일 인증이 완료되지 않았습니다." });
  }

  // 이미 가입된 이메일 체크
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "이미 가입된 이메일입니다." });
  }

  try {
    // ❌ DO NOT hash manually here; User model pre-save hook will handle it
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log("SIGNUP SUCCESS:", user.email);

    res.status(201).json({
      message: "회원가입 완료!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "회원가입 실패", error: err.message });
  }
});

// ----------------- LOGIN -----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN BODY:", req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`LOGIN WARNING: User not found: ${email}`);
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      console.warn(`LOGIN WARNING: Invalid password for email: ${email}`);
      return res.status(400).json({ message: "비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`LOGIN SUCCESS: ${email}`);

    res.json({
      message: "로그인 성공",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});



// ----------------- AUTH MIDDLEWARE -----------------
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user; // 로그인된 사용자 정보 저장
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(401).json({ message: "Token invalid" });
  }
}

// ----------------- GET CURRENT USER -----------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // authMiddleware에서 req.user 세팅
    if (!req.user) return res.status(404).json({ message: "User not found" });
    
    res.json({ user: req.user });
  } catch (err) {
    console.error("GET /me ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;