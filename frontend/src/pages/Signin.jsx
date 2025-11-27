import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "../css/sign.css";
import { UserContext } from "../contexts/UserContext";   // ⬅ 추가

export default function SignIn() {
  const navigate = useNavigate();

  const { login } = useContext(UserContext); // ⬅ Context의 로그인 함수 가져오기

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

      // 🔥 UserContext에 로그인 정보 전달 → Navbar 즉시 업데이트됨
      login(data.user);

      // JWT는 추가로 저장
      localStorage.setItem("token", data.token);

      alert("로그인 성공!");
      navigate("/");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="example@sdh.hs.kr" 
          />
        </div>

        <div className="input-group">
          <label>비밀번호</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="******"
          />
        </div>

        <button type="submit" className="signup-btn">로그인</button>
        <Link className="have-account" to="/signup">계정이 없으신가요?</Link>
      </form>
    </div>
  );
}
