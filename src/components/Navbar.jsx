import { useState } from "react";
import { NavLink } from "react-router-dom";
import BannerImage from "../assets/images/banner.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="container">
      {/* Banner Above Navbar */}
      <div className="banner">
        <img src={BannerImage} alt="Adams Verse Banner" />
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-inner">
          {/* Hamburger for Mobile */}
          <button className="hamburger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Links */}
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              About
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              Blog
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
}