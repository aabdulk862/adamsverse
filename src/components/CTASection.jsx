import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";

export default function CTASection() {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <AnimatedSection>
        <div className="cta-section-inner">
          <h2 id="cta-heading" className="cta-section-heading">
            Need something custom built?
          </h2>
          <p className="cta-section-description">
            From full-stack applications to tailored integrations, we build
            software that fits your business exactly.
          </p>
          <Link to="/contact" className="cta-section-link">
            Inquire about custom development{" "}
            <i className="fas fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </AnimatedSection>
    </section>
  );
}
