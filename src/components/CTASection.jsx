import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.ctaSection} aria-labelledby="cta-heading">
      <AnimatedSection>
        <div className={styles.inner}>
          <span className={styles.badge}>Custom Development</span>
          <h2 id="cta-heading" className={styles.heading}>
            Let's build your next system.
          </h2>
          <p className={styles.description}>
            Full-stack platforms, API integrations, and infrastructure that
            scales — built by an engineer who's shipped production systems at
            enterprise scale.
          </p>
          <div className={styles.actions}>
            <Link to="/contact" className={styles.linkPrimary}>
              Start a conversation{" "}
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/services" className={styles.linkGhost}>
              See pricing
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
