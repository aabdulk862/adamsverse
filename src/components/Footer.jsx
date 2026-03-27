import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-nav">
        <Link to="/">Home</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/learn">Learn</Link>
        <Link to="/#contact">Contact</Link>
      </nav>

      <div className="footer-socials">
        <a
          href="https://github.com/aabdulk862"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <i className="fab fa-github"></i>
        </a>
        <a
          href="https://linkedin.com/in/adam-abdulkadir"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="mailto:adamvmedia@outlook.com" aria-label="Email">
          <i className="fas fa-envelope"></i>
        </a>
      </div>

      <p className="footer-copyright">
        &copy; {new Date().getFullYear()} Adverse LLC
      </p>
    </footer>
  );
}
