import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo2 from "../assets/images/logo2.png";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroSection} aria-labelledby="hero-heading">
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <img
          src={logo2}
          alt="Adverse Solutions logo"
          className={styles.logo}
          width="72"
          height="72"
          fetchPriority="high"
          decoding="async"
        />

        <h1 id="hero-heading" className={styles.tagline}>
          Your business deserves a website that works as hard as you do.
        </h1>

        <p className={styles.valueProp}>
          We build websites for small businesses —
          fast, affordable, and done right.
        </p>

        <div className={styles.actions}>
          <Link to="/packages" className={styles.btnPrimary}>
            Browse Website Packages
          </Link>
          <Link to="/contact" className={styles.btnSecondary}>
            Let's Talk
          </Link>
        </div>

        <p className={styles.credibility}>
          Built by a software engineer · Charlotte, NC
        </p>
      </motion.div>
    </section>
  );
}
