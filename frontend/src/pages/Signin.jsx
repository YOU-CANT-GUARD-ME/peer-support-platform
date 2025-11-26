import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/sign.css";
import { API_BASE_URL } from "../api";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "로그인 실패");
        return;
      }

      // Save JWT token
      localStorage.setItem("token", data.token);

      alert("로그인 성공!");
      navigate("/"); // redirect home (you can change)
    } catch (err) {
      console.error(err);
      alert("서버 오류 발생");
    }
  };

  return (
    <div className="sign-container">
      <form className="signup-box" onSubmit={handleLogin}>
        <h2 className="signup-title">Sign In</h2>

        <div className="input-group">
          <label>이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="signup-btn">
          로그인
        </button>
        <Link className="have-account" to="/signup">
          계정이 없으신가요?
        </Link>
      </form>
    </div>
  );
}
