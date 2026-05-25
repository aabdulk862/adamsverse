import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ServicesSection.module.css";

/**
 * ServicesSection — Highlights web development services with navigation
 * links to /services and /packages routes.
 *
 * Positioned within the first two viewport-heights on 768px+ viewports.
 * Uses design tokens from tokens.css for styling.
 *
 * Requirements: 7.1, 7.4
 */
export default function ServicesSection() {
  return (
    <section className={styles.servicesSection} aria-labelledby="services-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <h2 id="services-heading" className={styles.heading}>
            Systems & Services
          </h2>
          <p className={styles.description}>
            Full-stack platforms, AI integrations, and production-ready website
            packages — engineered for businesses that need to move fast.
          </p>
          <nav className={styles.nav} aria-label="Services navigation">
            <Link to="/services" className={styles.link}>
              View All Services
            </Link>
            <Link to="/packages" className={styles.link}>
              Browse Packages
            </Link>
          </nav>
        </div>
      </AnimatedSection>
    </section>
  );
}
