import express from "express";
<<<<<<< HEAD
import User from "./models/User.js"; // User 모델
=======
import User from "./models/User.js"; 
>>>>>>> d200e2a (그룹 오류 수정)
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
<<<<<<< HEAD
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "Signup successful." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ user 객체 포함해서 반환
    res.json({
      message: "Login successful.",
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
=======
  try {
    const { name, email, password } = req.body;
    
    // 💡 1. 이메일 도메인 유효성 검사 추가
    const requiredDomain = "@sdh.hs.kr";
    if (!email.endsWith(requiredDomain)) {
        return res.status(403).json({ 
            message: `가입은 ${requiredDomain} 이메일로만 가능합니다.`
        });
    }
    // 💡 유효성 검사 끝
    
    // 2. 이메일 중복 검사 (기존 로직)
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    // 3. 비밀번호 해시 및 사용자 저장 (기존 로직)
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.status(201).json({ message: "Signup successful." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

  // ---------------- LOGIN ----------------
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ message: "Invalid password." });

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // ✅ user 객체 포함해서 반환
      res.json({
        message: "Login successful.",
        user: { id: user._id, name: user.name, email: user.email },
        token,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  export default router;
>>>>>>> d200e2a (그룹 오류 수정)
