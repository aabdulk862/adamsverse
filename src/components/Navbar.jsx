import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo5.png";

const PAGE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "Learn", to: "/learn" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile overlay on resize above 600px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 600) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Adverse LLC logo" className="navbar-logo" />
          <span className="navbar-brand-name">Adverse</span>
        </Link>

        {/* Desktop nav links + CTA */}
        <ul className="navbar-links">
          {PAGE_LINKS.map((page) => (
            <li key={page.to}>
              <Link to={page.to}>{page.label}</Link>
            </li>
          ))}
          <li>
            <Link to="/contact" className="navbar-cta">
              Get in Touch
            </Link>
          </li>
        </ul>

        {/* Hamburger button (mobile) */}
        <button
          className="navbar-hamburger"
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="navbar-overlay">
          {PAGE_LINKS.map((page) => (
            <Link key={page.to} to={page.to} onClick={closeMobile}>
              {page.label}
            </Link>
          ))}
          <Link to="/contact" className="navbar-cta" onClick={closeMobile}>
            Get in Touch
          </Link>
        </div>
      )}
    </nav>
  );
}
