import { useState } from "react";
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
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>
    </div>
  );
}