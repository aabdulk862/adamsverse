import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./ProfileHeader.module.css";

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
      className={`${styles.hero} ${styles.heroGradient}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, ease: "easeOut" }}
    >
      {/* Eyebrow */}
      <p className={styles.eyebrow}>
        <i
          className={`fas fa-circle ${styles.eyebrowIcon}`}
          style={{ fontSize: "6px", color: "var(--success-color)" }}
        ></i>{" "}
        Available for projects
      </p>

      {/* Headline */}
      <h1 className={styles.headline}>
        We build the <span className={styles.accent}>software</span>. You run the
        business.
      </h1>

      {/* Subheadline */}
      <p className={styles.sub}>
        Adverse Solutions builds websites, full-stack applications, cloud
        infrastructure, and provides technical consulting for businesses that
        need reliable software without the agency overhead.
      </p>

      {/* CTAs */}
      <div className={styles.ctas}>
        <Link to="/contact" className={`${styles.btn} ${styles.btnPrimary}`}>
          Start a project <i className="fas fa-arrow-right"></i>
        </Link>
        <Link to="/packages" className={`${styles.btn} ${styles.btnGhost}`}>
          View packages
        </Link>
      </div>

      {/* Trust tagline */}
      <p className={styles.trustTagline}>
        Adverse Solutions · Transparent pricing · Full-stack ownership · No agency overhead
      </p>
    </motion.section>
  );
}
