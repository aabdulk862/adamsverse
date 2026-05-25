import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ServicesSection.module.css";

const highlights = [
  {
    icon: "fas fa-layer-group",
    title: "Productized Systems",
    desc: "Website packages, business tools, and SaaS products — ready to deploy, built to scale.",
  },
  {
    icon: "fas fa-code",
    title: "Custom Engineering",
    desc: "Full-stack platforms, APIs, and infrastructure built to your exact requirements.",
  },
  {
    icon: "fas fa-handshake",
    title: "Strategic Partnerships",
    desc: "Technical co-building for founders and operators with validated ideas and traction.",
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection} aria-labelledby="services-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="services-heading" className={styles.heading}>
              How We Work
            </h2>
            <p className={styles.description}>
              Three lanes — productized systems, custom engineering, and
              selective partnerships with operators who have traction.
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
