import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

/**
 * HeroSection — Product Hub hero displaying the Adverse brand logo,
 * a tagline (max 80 chars), and a value proposition (max 200 chars).
 * Uses design tokens from tokens.css for consistent styling.
 */
export default function HeroSection() {
  const tagline = "AI-powered systems for modern businesses.";
  const valueProp =
    "We design, build, and deploy intelligent platforms, websites, and tools — so you can launch faster and scale with confidence.";

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
          fetchpriority="high"
          decoding="async"
        />

        <h1 id="hero-heading" className={styles.tagline}>
          {tagline}
        </h1>

        <p className={styles.valueProp}>{valueProp}</p>
      </motion.div>
    </section>
  );
}
