// src/Navbar.jsx
import React from "react";
import "./Navbar.css"; // CSS file for the navbar

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">DRC</div>
      <ul className="nav-links">
        <li>Home</li>
        <li>Community</li>
        <li>Mentors</li>
        <li>Groups</li>
        <li>Login</li>
      </ul>
    </nav>
  );
}
