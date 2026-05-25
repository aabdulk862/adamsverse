import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./CTASection.module.css";

export default function CTASection() {
  return (
    <section className={styles.ctaSection} aria-labelledby="cta-heading">
      <AnimatedSection>
        <div className={styles.inner}>
          <h2 id="cta-heading" className={styles.heading}>
            Need something custom built?
          </h2>
          <p className={styles.description}>
            From full-stack applications to tailored integrations, we build
            software that fits your business exactly.
          </p>
          <Link to="/contact" className={styles.link}>
            Inquire about custom development{" "}
            <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}
