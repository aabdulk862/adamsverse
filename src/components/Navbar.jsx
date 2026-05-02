import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/images/logo5.png";

const overlayVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
  exit: { x: "100%", transition: { type: "tween", duration: 0.25 } },
};

const linkVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { type: "tween", duration: 0.2 } },
};

const PAGE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Packages", to: "/packages" },
  { label: "Services", to: "/services" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const overlayRef = useRef(null);
  const { user, profile, loading, isAdmin, signInWithGoogle, signOut } =
    useAuth();
  const { theme, toggleTheme } = useTheme();

  // Toggle navbar--scrolled class when scrolled past 10px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll(); // check initial position
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus management: move focus into overlay on open, return to hamburger on close
  useEffect(() => {
    if (mobileOpen) {
      // Wait for overlay animation to start, then focus first link
      const timer = setTimeout(() => {
        if (overlayRef.current) {
          const firstFocusable = overlayRef.current.querySelector("a, button");
          if (firstFocusable) firstFocusable.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Return focus to hamburger button when overlay closes
      if (hamburgerRef.current) {
        hamburgerRef.current.focus();
      }
    }
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    closeMobile();
    await signOut();
  };

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName =
    profile?.display_name || user?.user_metadata?.full_name || "User";

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Adverse Solutions logo" className="navbar-logo" />
          <span className="navbar-brand-name">Adverse Solutions</span>
        </Link>

        {/* Desktop nav links + CTA + Auth */}
        <ul className="navbar-links">
          {PAGE_LINKS.map((page) => (
            <li key={page.to}>
              <Link to={page.to}>{page.label}</Link>
            </li>
          ))}
          <li>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              type="button"
            >
              <i className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"} />
            </button>
          </li>
          <li>
            <Link to="/contact" className="navbar-cta">
              Get in Touch
            </Link>
          </li>

          {/* Auth — hidden until functionality is complete
          {!user && (
            <li>
              <Link to="/login" className="navbar-auth-btn">
                Sign In
              </Link>
            </li>
          )}
          */}

          {user && (
            <li className="navbar-user-menu" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                type="button"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="navbar-avatar"
                  />
                ) : (
                  <span className="navbar-avatar-fallback">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{displayName}</span>
                    <span className="navbar-dropdown-email">
                      {profile?.email || user?.email}
                    </span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link
                    to="/dashboard"
                    className="navbar-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/dashboard/settings"
                    className="navbar-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="navbar-dropdown-divider" />
                  <button
                    className="navbar-dropdown-item navbar-dropdown-signout"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>

        {/* Hamburger button (mobile) */}
        <button
          className="navbar-hamburger"
          type="button"
          ref={hamburgerRef}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop — tap to close */}
            <motion.div
              className="navbar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
            />
            {/* Drawer */}
            <motion.div
              className="navbar-overlay"
              ref={overlayRef}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close button */}
              <button
                className="navbar-overlay-close"
                onClick={closeMobile}
                type="button"
                aria-label="Close menu"
              >
                <i className="fas fa-times"></i>
              </button>

              {PAGE_LINKS.map((page) => (
                <motion.div key={page.to} variants={linkVariants}>
                  <Link to={page.to} onClick={closeMobile}>
                    {page.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={linkVariants}>
                <button
                  className="theme-toggle theme-toggle--mobile"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "light"
                      ? "Switch to dark mode"
                      : "Switch to light mode"
                  }
                  type="button"
                >
                  <i
                    className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}
                  />
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </motion.div>
              <motion.div variants={linkVariants}>
                <Link
                  to="/contact"
                  className="navbar-cta"
                  onClick={closeMobile}
                >
                  Get in Touch
                </Link>
              </motion.div>

              {/* Mobile auth — hidden until functionality is complete */}
              {/*
              <motion.div className="navbar-overlay-auth" variants={linkVariants}>
                {!user && (
                  <Link to="/login" className="navbar-auth-btn" onClick={closeMobile}>
                    Sign In
                  </Link>
                )}

                {user && (
                  <>
                    <div className="navbar-overlay-user">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="navbar-avatar"
                        />
                      ) : (
                        <span className="navbar-avatar-fallback">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="navbar-overlay-user-name">
                        {displayName}
                      </span>
                    </div>
                    <Link to="/dashboard" onClick={closeMobile}>
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={closeMobile}>
                        Admin
                      </Link>
                    )}
                    <Link to="/dashboard/settings" onClick={closeMobile}>
                      Settings
                    </Link>
                    <button
                      className="navbar-overlay-signout"
                      onClick={handleSignOut}
                      type="button"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </motion.div>
              */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
