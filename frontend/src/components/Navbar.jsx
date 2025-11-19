// src/Navbar.jsx
import React from "react";
import "../css/Navbar.css"; // CSS file for the navbar
import { Link } from "react-router-dom";
import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo"><img src={logo} alt="logo" /></div>
      <ul className="nav-links">
        <Link to='/'>Home</Link>
        <Link to='/community'>Community</Link>
        <Link to='/mentors'>Mentors</Link>
        <Link to='/group'>Groups</Link>
        <Link to='/signin'>Login</Link>
      </ul>
    </nav>
  );
}
