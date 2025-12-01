// src/components/Navbar.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { ThemeContext } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";
import "../css/Navbar.css";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useContext(UserContext);
  const [openSidebar, setOpenSidebar] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    setOpenSidebar(false);
  };

  return (
    <> <nav className="navbar"> <Link to="/" className="logo"> <img src={logo} alt="logo" /> </Link>

      <ul className="nav-links">
        <Link to="/community">커뮤니티</Link>
        <Link to="/group">그룹</Link>
        <Link to="/diary">다이어리</Link>
        <Link to="/counsel">상담 신청</Link>

        <li onClick={() => setOpenSidebar(true)}>
          설정
        </li>
      </ul>
    </nav>

      {/* ===== 오른쪽 사이드바 ===== */}
      <div
        className={`sidebar-overlay ${openSidebar ? "active" : ""}`}
        onClick={() => setOpenSidebar(false)}
      >
        <div className="sidebar-box" onClick={(e) => e.stopPropagation()}>
          {isLoggedIn ? (
            <>
              <h3>{user?.name}님 환영합니다!</h3>
              <button className="sidebar-btn" onClick={toggleTheme}>
                {darkMode ? "라이트모드" : "다크모드"}
              </button>
              <Link to="/counsel-records" className="sidebar-btn">상담 신청 기록</Link>
              <Link to="/my-group" className="sidebar-btn">마이 그룹</Link>
              <button className="sidebar-btn logout-btn" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <h3>로그인 후 이용해주세요.</h3>
              <Link to='/signup' className="sidebar-btn">회원가입</Link>
              <Link to="/signin" className="sidebar-btn">로그인</Link>
              <button className="sidebar-btn" onClick={toggleTheme}>
                {darkMode ? "라이트모드" : "다크모드"}
              </button>
            </>
          )}
        </div>
      </div>
    </>

  );
}
