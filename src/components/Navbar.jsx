import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          AdamsVerse
        </Link>

        {/* Desktop Links */}
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/services" onClick={closeMenu}>Services</NavLink>
          <NavLink to="/projects" onClick={closeMenu}>Projects</NavLink>
          <NavLink to="/blog" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
        </nav>

        {/* Hamburger */}
        <button className="hamburger" onClick={toggleMenu}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
