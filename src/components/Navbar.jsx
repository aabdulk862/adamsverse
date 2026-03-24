import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  { name: "iGamec", url: "https://igamec.org" },
];

const SECTIONS = [
  { label: "Pricing", id: "pricing" },
  { label: "Content & Socials", id: "content-socials" },
  { label: "Support", id: "support" },
  { label: "Contact Me", id: "contact" },
];

const LEARN_LINKS = [
  { label: "DSA Guide", href: "/dsa.html" },
  { label: "LeetCode Guide", href: "/leetcode.html" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
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
        setProjectsOpen(false);
        setLearnOpen(false);
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
        <a className="navbar-brand" href="#">AdamsVerse</a>

        {/* Desktop nav links */}
        <ul className="navbar-links">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}

          {/* Projects dropdown */}
          <li
            className="navbar-dropdown"
            onMouseEnter={() => setProjectsOpen(true)}
            onMouseLeave={() => setProjectsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setProjectsOpen((prev) => !prev)}
              aria-expanded={projectsOpen}
            >
              Projects ▾
            </button>
            {projectsOpen && (
              <div className="navbar-dropdown-menu">
                {PROJECTS.length === 0 ? (
                  <span className="navbar-dropdown-placeholder">No projects yet</span>
                ) : (
                  PROJECTS.map((project) => (
                    <a
                      key={project.name}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                    </a>
                  ))
                )}
              </div>
            )}
          </li>

          {/* Learn dropdown */}
          <li
            className="navbar-dropdown"
            onMouseEnter={() => setLearnOpen(true)}
            onMouseLeave={() => setLearnOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLearnOpen((prev) => !prev)}
              aria-expanded={learnOpen}
            >
              Learn ▾
            </button>
            {learnOpen && (
              <div className="navbar-dropdown-menu">
                {LEARN_LINKS.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.label}
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
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={handleSectionClick}
            >
              {section.label}
            </a>
          ))}

          {/* Projects accordion group */}
          <div className="navbar-overlay-group">
            <button
              type="button"
              onClick={() => setProjectsOpen((prev) => !prev)}
              aria-expanded={projectsOpen}
            >
              Projects {projectsOpen ? "▴" : "▾"}
            </button>
            {projectsOpen && (
              <div className="navbar-dropdown-menu">
                {PROJECTS.length === 0 ? (
                  <span className="navbar-dropdown-placeholder">No projects yet</span>
                ) : (
                  PROJECTS.map((project) => (
                    <a
                      key={project.name}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobile}
                    >
                      {project.name}
                    </a>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Learn accordion group */}
          <div className="navbar-overlay-group">
            <button
              type="button"
              onClick={() => setLearnOpen((prev) => !prev)}
              aria-expanded={learnOpen}
            >
              Learn {learnOpen ? "▴" : "▾"}
            </button>
            {learnOpen && (
              <div className="navbar-dropdown-menu">
                {LEARN_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
