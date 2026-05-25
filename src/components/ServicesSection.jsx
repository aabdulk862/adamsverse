import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";

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
    <section className="services-section" aria-labelledby="services-heading">
      <AnimatedSection>
        <div className="services-section__container">
          <h2 id="services-heading" className="services-section__heading">
            Systems & Services
          </h2>
          <p className="services-section__description">
            Full-stack platforms, AI integrations, and production-ready website
            packages — engineered for businesses that need to move fast.
          </p>
          <nav className="services-section__nav" aria-label="Services navigation">
            <Link to="/services" className="services-section__link">
              View All Services
            </Link>
            <Link to="/packages" className="services-section__link">
              Browse Packages
            </Link>
          </nav>
        </div>
      </AnimatedSection>
    </section>
  );
}
