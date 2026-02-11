import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/images/logo3.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <NavLink to="/" className="nav-logo" onClick={closeMenu}>
          <img
            src={Logo} // replace with your actual logo path
            alt="Logo"
            className="nav-logo-img"
          />
        </NavLink>

        {/* Desktop & Mobile Links */}
        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/services" onClick={closeMenu}>
            Services
          </NavLink>
          <NavLink to="/projects" onClick={closeMenu}>
            Projects
          </NavLink>
          <NavLink to="/blog" onClick={closeMenu}>
            Blog
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        {/* Hamburger */}
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
