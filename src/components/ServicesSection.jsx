import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ServicesSection.module.css";

const highlights = [
  {
    icon: "fas fa-code",
    title: "Custom Platforms",
    desc: "Full-stack applications with APIs, databases, and cloud deployment.",
  },
  {
    icon: "fas fa-plug",
    title: "Integrations",
    desc: "Connect your tools — payment processing, CRMs, booking systems.",
  },
  {
    icon: "fas fa-chart-line",
    title: "Growth Systems",
    desc: "SEO, analytics, and automation that drive measurable results.",
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection} aria-labelledby="services-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="services-heading" className={styles.heading}>
              Beyond the Website
            </h2>
            <p className={styles.description}>
              Custom platforms, API integrations, and full-stack applications —
              for businesses that have outgrown templates and need real engineering.
            </p>
          </div>

          <div className={styles.grid}>
            {highlights.map((item) => (
              <div key={item.title} className={styles.card}>
                <div className={styles.cardIcon}>
                  <i className={item.icon} aria-hidden="true"></i>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>

          <nav className={styles.nav} aria-label="Services navigation">
            <Link to="/services" className={styles.linkPrimary}>
              View All Services <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/packages" className={styles.linkSecondary}>
              Browse Packages
            </Link>
          </nav>
        </div>
      </AnimatedSection>
    </section>
  );
}
