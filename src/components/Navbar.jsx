import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/logo5.png";

const PAGE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "Learn", to: "/learn" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, profile, loading, isAdmin, signInWithGoogle, signOut } =
    useAuth();

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
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Adverse LLC logo" className="navbar-logo" />
          <span className="navbar-brand-name">Adverse</span>
        </Link>

        {/* Desktop nav links + CTA + Auth */}
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

          {/* Auth elements — after existing nav items */}
          {!user && (
            <li>
              <button
                className="navbar-sign-in"
                onClick={signInWithGoogle}
                type="button"
              >
                Sign in with Google
              </button>
            </li>
          )}

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

          {/* Mobile auth elements */}
          <div className="navbar-overlay-auth">
            {!user && (
              <button
                className="navbar-sign-in"
                onClick={() => {
                  closeMobile();
                  signInWithGoogle();
                }}
                type="button"
              >
                Sign in with Google
              </button>
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
          </div>
        </div>
      )}
    </nav>
  );
}
