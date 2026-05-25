import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.ctaSection} aria-labelledby="cta-heading">
      <AnimatedSection>
        <div className={styles.inner}>
          <span className={styles.badge}>Work With Us</span>
          <h2 id="cta-heading" className={styles.heading}>
            Have a product idea or a system to build?
          </h2>
          <p className={styles.description}>
            Whether you need a website that launches next week, a platform
            built from scratch, or a technical partner for something bigger —
            let's talk.
          </p>
          <div className={styles.actions}>
            <Link to="/contact" className={styles.linkPrimary}>
              Start a conversation{" "}
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/packages" className={styles.linkGhost}>
              Browse packages
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
