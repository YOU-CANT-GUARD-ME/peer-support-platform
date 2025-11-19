// src/Navbar.jsx
import React from "react";
import "../css/Navbar.css"; // CSS file for the navbar
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">DRC</div>
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
