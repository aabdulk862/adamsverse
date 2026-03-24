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
      </nav>

      <div className="footer-socials">
        <a href="mailto:adamvmedia@outlook.com" aria-label="Email">
          <i className="fas fa-envelope"></i>
        </a>
        <a href="https://www.youtube.com/@theadamverse" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <i className="fab fa-youtube"></i>
        </a>
        <a href="https://twitch.tv/adams_verse" target="_blank" rel="noopener noreferrer" aria-label="Twitch">
          <i className="fab fa-twitch"></i>
        </a>
        <a href="https://www.tiktok.com/@adams_verse" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <i className="fab fa-tiktok"></i>
        </a>
        <a href="https://x.com/theadamverse" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <i className="fab fa-twitter"></i>
        </a>
        <a href="https://instagram.com/adam.abdulkadir" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <i className="fab fa-instagram"></i>
        </a>
      </div>

      <p className="footer-copyright">&copy; 2026 AdamsVerse LLC</p>
    </footer>
  );
}
