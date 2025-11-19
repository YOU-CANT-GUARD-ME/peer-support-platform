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
        <Link to='/'>Home</Link>
        <Link to='/community'>Community</Link>
        <Link to='/group'>Groups</Link>
        <Link to='/diary'>Diary</Link>
        <Link to='/signin'>Login</Link>
      </ul>
    </nav>
  );
}
