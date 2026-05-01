import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

export default function ProfileHeader() {
  const isMobile = useIsMobile();
  const dur = isMobile ? 0.25 : 0.4;

  return (
    <motion.section
      className="hero hero--gradient"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, ease: "easeOut" }}
    >
      {/* Eyebrow */}
      <p className="hero-eyebrow">
        <i
          className="fas fa-circle"
          style={{ fontSize: "6px", color: "var(--success-color)" }}
        ></i>{" "}
        Available for projects
      </p>

      {/* Headline */}
      <h1 className="hero-headline">
        We build the <span className="hero-accent">software</span>. You run the
        business.
      </h1>

      {/* Subheadline */}
      <p className="hero-sub">
        Websites, full-stack applications, cloud infrastructure, and technical
        consulting for businesses that need reliable software solutions without the agency
        overhead.
      </p>

      {/* CTAs */}
      <div className="hero-ctas">
        <Link to="/contact" className="hero-btn hero-btn--primary">
          Start a project <i className="fas fa-arrow-right"></i>
        </Link>
        <Link to="/packages" className="hero-btn hero-btn--ghost">
          View packages
        </Link>
      </div>

      {/* Trust tagline */}
      <p className="hero-trust-tagline">
        Transparent pricing · Full-stack ownership · No agency overhead
      </p>
    </motion.section>
  );
}
