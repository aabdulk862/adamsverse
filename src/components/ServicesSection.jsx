import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ServicesSection.module.css";

const highlights = [
  {
    icon: "fas fa-code",
    title: "Custom Software",
    desc: "Full-stack applications built to your exact requirements — APIs, databases, cloud deployment.",
  },
  {
    icon: "fas fa-robot",
    title: "AI & Automation",
    desc: "Workflows that eliminate manual work — content generation, data processing, smart integrations.",
  },
  {
    icon: "fas fa-chart-line",
    title: "Growth Infrastructure",
    desc: "SEO, analytics, and systems that compound — so your business grows while you sleep.",
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection} aria-labelledby="services-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="services-heading" className={styles.heading}>
              Custom Solutions
            </h2>
            <p className={styles.description}>
              For businesses that have outgrown templates and need software
              engineered specifically for how they operate.
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
