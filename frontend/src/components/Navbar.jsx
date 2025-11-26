// src/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/Navbar.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // localStorage에서 user 정보 가져오기
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
        setUser(null);
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = "/"; // 로그아웃 후 홈으로 이동
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="logo" />
      </Link>

      <ul className="nav-links">
        <li><Link to="/community">커뮤니티</Link></li>
        <li><Link to="/group">그룹</Link></li>
        <li><Link to="/diary">다이어리</Link></li>
        <li><Link to="/counsel">상담 신청</Link></li>

        {isLoggedIn ? (
          <>
            <li>
              <span>{user?.name || "사용자"}님 환영합니다!</span>
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/signin">로그인</Link></li>
        )}
      </ul>
    </nav>
  );
}
