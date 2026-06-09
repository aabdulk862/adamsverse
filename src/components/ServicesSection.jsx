import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ServicesSection.module.css";

const highlights = [
  {
    icon: "fas fa-layer-group",
    title: "Need a Website Fast?",
    desc: "Pick your industry, choose a design, and launch. Packages start at a flat rate — no surprises.",
  },
  {
    icon: "fas fa-code",
    title: "Need Something Custom?",
    desc: "Apps, platforms, automations — if you can describe it, we can build it. Let's talk scope.",
  },
  {
    icon: "fas fa-handshake",
    title: "Building a Product?",
    desc: "We partner with founders who have traction and need a technical co-builder, not just a contractor.",
  },
];

export default function ServicesSection() {
  return (
    <section className={styles.servicesSection} aria-labelledby="services-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 id="services-heading" className={styles.heading}>
              What Can We Help With?
            </h2>
            <p className={styles.description}>
              Whether you need a simple website or a full platform — we've got
              an option that fits.
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
