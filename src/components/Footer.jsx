import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/packages">Packages</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className={styles.socials}>
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

      <p className={styles.copyright}>
        &copy; {new Date().getFullYear()} Adverse Solutions LLC
      </p>
    </footer>
  );
}
