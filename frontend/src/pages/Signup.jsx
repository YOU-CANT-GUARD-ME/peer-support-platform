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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "회원가입 실패");
        return;
      }

      alert("회원가입 완료!");
      navigate("/signIn");
    } catch (err) {
      console.error(err);
      alert("서버 오류가 발생했습니다.");
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
            placeholder="example@email.com"
          />
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

        <button className="signup-btn" type="submit">
          회원가입
        </button>
        <Link className="have-account" to="/signIn">
          이미 계정이 있으신가요?
        </Link>
      </form>
    </div>
  );
}
