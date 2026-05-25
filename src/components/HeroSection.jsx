import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

/**
 * HeroSection — Product Hub hero displaying the Adverse brand logo,
 * a tagline (max 80 chars), and a value proposition (max 200 chars).
 * Uses design tokens from tokens.css for consistent styling.
 */
export default function HeroSection() {
  const tagline = "Digital systems that grow your business.";
  const valueProp =
    "We build the websites, automations, and platforms that local businesses need to get found, convert customers, and scale — engineered with the same standards used at Fortune 500 companies.";
  const credibility = "Built by a software engineer with enterprise experience at Charter Communications.";

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

        <p className={styles.credibility}>{credibility}</p>
      </motion.div>
    </section>
  );
}
