// authVerify.js
import express from "express";
import EmailVerification from "./models/EmailVerification.js";

export default function createAuthVerifyRoutes(transporter) {
  const router = express.Router();

  function isAllowedDomain(email) {
    return email.endsWith("@sdh.hs.kr");
  }

  // ---------------------------
  // 인증코드 발송
  // ---------------------------
  router.post("/send-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "이메일 필요" });
      if (!isAllowedDomain(email)) return res.status(400).json({ message: "학교 이메일만 인증 가능" });

      const code = String(Math.floor(100000 + Math.random() * 900000));

      await EmailVerification.findOneAndUpdate(
        { email },
        { code, verified: false, createdAt: new Date() },
        { upsert: true, new: true }
      );

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "학교 이메일 인증 코드",
        text: `인증코드: ${code}`,
      });

      res.json({ message: "인증코드 발송 완료" });
    } catch (err) {
      console.error("Send code error:", err);
      res.status(500).json({ message: "메일 발송 실패", error: err.message });
    }
  });

  // ---------------------------
  // 인증코드 검증 (verified=true 저장)
  // ---------------------------
  router.post("/verify-code", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ message: "이메일과 코드 필요" });

      const record = await EmailVerification.findOne({ email });
      if (!record) return res.status(400).json({ message: "먼저 인증코드 발송 필요" });

      if (record.code !== code) return res.status(400).json({ message: "인증코드 불일치" });

      record.verified = true;
      await record.save();

      res.json({ message: "이메일 인증 성공", verified: true });

    } catch (err) {
      console.error("Verify code error:", err);
      res.status(500).json({ message: "서버 오류", error: err.message });
    }
  });

  return router;
}