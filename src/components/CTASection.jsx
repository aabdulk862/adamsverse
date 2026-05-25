import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.ctaSection} aria-labelledby="cta-heading">
      <AnimatedSection>
        <div className={styles.inner}>
          <span className={styles.badge}>Let's Talk</span>
          <h2 id="cta-heading" className={styles.heading}>
            Have something specific in mind?
          </h2>
          <p className={styles.description}>
            Whether it's a website that needs to launch next month or a platform
            that needs to be rebuilt properly — let's figure out the right
            approach together.
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
