// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import logo from "../assets/logo.png";
import "../css/Navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useContext(UserContext);
  const [openModal, setOpenModal] = useState(false);

  const handleLogout = () => {
    logout();
    setOpenModal(false);
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
              {user?.name}님 환영합니다!
            </li>
          ) : (
            <li><Link to="/signin">로그인</Link></li>
          )}
        </ul>
      </nav>

      {/* ===== 중앙 모달 ===== */}
      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
