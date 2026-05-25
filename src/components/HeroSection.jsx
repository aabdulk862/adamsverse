import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroSection} aria-labelledby="hero-heading">
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img
          src="/logo.png"
          alt="Adverse Solutions logo"
          className={styles.logo}
          width="72"
          height="72"
          fetchPriority="high"
          decoding="async"
        />

        <h1 id="hero-heading" className={styles.tagline}>
          Modern systems for businesses that move fast.
        </h1>

        <p className={styles.valueProp}>
          From production-ready websites to custom platforms and operational
          tools — we help businesses launch, automate, and scale.
        </p>

        <div className={styles.actions}>
          <Link to="/packages" className={styles.btnPrimary}>
            Browse Website Packages
          </Link>
          <a href="#tools" className={styles.btnSecondary}>
            Explore Tools
          </a>
        </div>

        <p className={styles.credibility}>
          Enterprise engineering experience at Charter Communications
        </p>
      </motion.div>
    </section>
  );
}
