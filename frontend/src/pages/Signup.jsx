import React, { useState } from "react";
import "../css/sign.css";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isAllowedDomain = (email) => email.endsWith("@sdh.hs.kr");

  // -----------------------------
  // 인증코드 발송
  // -----------------------------
  const handleSendCode = async () => {
    if (!form.email) return alert("이메일을 입력하세요.");
    if (!isAllowedDomain(form.email))
      return alert("학교 이메일만 사용할 수 있습니다.");

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) return alert(data.message || "인증코드 발송 실패");

      alert("인증코드가 이메일로 발송되었습니다!");
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 인증코드 확인
  // -----------------------------
  const handleVerifyCode = async () => {
    if (!verificationCode) return alert("인증코드를 입력하세요.");

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          code: verificationCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) return alert(data.message || "인증 실패");

      alert("이메일 인증 성공!");
      setEmailVerified(true);
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 회원가입 요청
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAllowedDomain(form.email))
      return alert("학교 이메일만 회원가입 가능합니다.");
    if (form.password !== form.confirm)
      return alert("비밀번호가 일치하지 않습니다.");
    if (!emailVerified)
      return alert("이메일 인증을 완료해야 회원가입 가능합니다.");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) return alert(data.message || "회원가입 실패");

      alert("회원가입 성공!");
      navigate("/signIn");
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h2 className="signup-title">Sign Up</h2>

        <div className="input-group">
          <label>실명</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="홍길동"
          />
        </div>

        <div className="input-group">
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@sdh.hs.kr"
            disabled={emailVerified}
          />
          <button
            type="button"
            className="signup-btn small-btn"
            onClick={handleSendCode}
            style={{ marginTop: "8px" }}
            disabled={emailVerified}
          >
            인증코드 발송
          </button>
        </div>

        <div className="input-group">
          <label>인증코드</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="6자리 코드 입력"
            disabled={emailVerified}
          />
          <button
            type="button"
            className="signup-btn small-btn"
            onClick={handleVerifyCode}
            style={{ marginTop: "8px" }}
            disabled={emailVerified}
          >
            {emailVerified ? "인증 완료" : "인증 확인"}
          </button>
        </div>

        <div className="input-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
          />
        </div>

        <div className="input-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="********"
          />
        </div>

        <button className="signup-btn" type="submit" disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </button>

        <Link className="have-account" to="/signIn">
          이미 계정이 있으신가요?
        </Link>
      </form>
    </div>
  );
}