import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo3.png";

const PROJECTS = [
  { name: "iGamec", url: "https://igamec.org" },
];

const SECTIONS = [
  { label: "Pricing", id: "pricing" },
  { label: "Content & Socials", id: "content-socials" },
  { label: "Support", id: "support" },
  { label: "Contact Me", id: "contact" },
];

const PAGE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "Learn", to: "/learn" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const navRef = useRef(null);

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

  // Click-outside handler to close open dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setSectionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleSectionClick = () => {
    closeMobile();
  };

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="AdamsVerse logo" className="navbar-logo" />
        </Link>

        {/* Desktop nav links */}
        <ul className="navbar-links">
          {/* Page links (About first) */}
          {PAGE_LINKS.map((page) => (
            <li key={page.to}>
              <Link to={page.to}>{page.label}</Link>
            </li>
          ))}

          {/* Home sections dropdown */}
          <li
            className="navbar-dropdown"
            onMouseEnter={() => setSectionsOpen(true)}
            onMouseLeave={() => setSectionsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSectionsOpen((prev) => !prev)}
              aria-expanded={sectionsOpen}
            >
              More ▾
            </button>
            {sectionsOpen && (
              <div className="navbar-dropdown-menu">
                {SECTIONS.map((section) => (
                  <a key={section.id} href={`/#${section.id}`}>
                    {section.label}
                  </a>
                ))}
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0" }} />
                {PROJECTS.map((project) => (
                  <a
                    key={project.name}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.name}
                  </a>
                ))}

              </div>
            )}
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
          {/* Page links first (About first) */}
          {PAGE_LINKS.map((page) => (
            <Link key={page.to} to={page.to} onClick={closeMobile}>
              {page.label}
            </Link>
          ))}

          {/* Section anchors */}
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`/#${section.id}`}
              onClick={handleSectionClick}
            >
              {section.label}
            </a>
          ))}

          {/* Projects & Learn */}
          {PROJECTS.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobile}
            >
              {project.name}
            </a>
          ))}

        </div>
      )}
    </nav>
  );
}
