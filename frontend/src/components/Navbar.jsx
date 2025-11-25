// src/Navbar.jsx
import React from "react";
import "../css/Navbar.css"; // CSS file for the navbar
import { Link } from "react-router-dom";
import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to='/' className="logo"><img src={logo} alt="logo" /></Link>
      <ul className="nav-links">
        <Link to='/community'>커뮤니티</Link>
        <Link to='/group'>그룹</Link>
        <Link to='/diary'>다이어리</Link>
        <Link to='/counsel'>상담 신청</Link>
        <Link to='/signin'>로그인</Link>
      </ul>
    </nav>
  );
}
