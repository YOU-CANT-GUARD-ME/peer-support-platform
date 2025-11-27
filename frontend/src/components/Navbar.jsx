// src/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../css/Navbar.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <>
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
            <li onClick={() => setOpenModal(true)} className="user-info">
              {user?.name || "사용자"}님 환영합니다!
            </li>
          ) : (
            <li><Link to="/signin">로그인</Link></li>
          )}
        </ul>
      </nav>

      {/* ===== 중앙 모달 ===== */}
      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
          >
            <h3>로그아웃 하시겠습니까?</h3>
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </>
  );
}
