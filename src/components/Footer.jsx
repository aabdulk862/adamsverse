import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Platform</h4>
          <Link to="/packages">Packages</Link>
          <Link to="/tools">Tools</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Resources</h4>
          <Link to="/learn">Learn with Adverse</Link>
          <a href="/dsa">DSA & Algorithms</a>
          <a href="/ai-website">AI Website Guide</a>
          <a href="/github">GitHub Guide</a>
        </div>

        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Company</h4>
          <Link to="/about">About</Link>
          <a
            href="https://github.com/aabdulk862"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/adam-abdulkadir"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="mailto:adamvmedia@outlook.com">Email</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Adverse Solutions LLC
        </p>
      </div>
    </footer>
  );
}
