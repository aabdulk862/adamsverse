import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
          src="/logo.png"
          alt="Adverse Solutions logo"
          className={styles.logo}
          width="72"
          height="72"
          fetchPriority="high"
          decoding="async"
        />

        <h1 id="hero-heading" className={styles.tagline}>
          Digital systems that grow your business.
        </h1>

        <p className={styles.valueProp}>
          Adverse is a software studio that ships modern systems for businesses
          and founders — websites, operational platforms, AI-enhanced workflows,
          and internal tools.
        </p>

        <div className={styles.actions}>
          <Link to="/packages" className={styles.btnPrimary}>
            Browse Website Packages
          </Link>
          <Link to="/tools" className={styles.btnSecondary}>
            Explore Tools
          </Link>
        </div>

        <p className={styles.credibility}>
          Software studio · Charlotte, NC
        </p>
      </motion.div>
    </section>
  );
}
