import { Link } from "react-router-dom";
import AnimatedSection from "./AnimatedSection";
import styles from "./ToolsHub.module.css";

const tools = [
  {
    id: "pdf-editor",
    name: "PDF Editor",
    desc: "Merge, split, annotate — no signup required.",
    icon: "fas fa-file-pdf",
    url: "/tools/pdf-editor",
    badge: "Beta",
    external: true,
  },
  {
    id: "basecamp",
    name: "Basecamp Atlas",
    desc: "Apartment discovery with maps, filters, and insights.",
    icon: "fas fa-map-marked-alt",
    url: "/tools/basecamp",
    badge: null,
    external: true,
  },
  {
    id: "learn",
    name: "Guides & Resources",
    desc: "DSA, system design, AI workflows, and developer references.",
    icon: "fas fa-graduation-cap",
    url: "/learn",
    badge: null,
    external: false,
  },
];

export default function ToolsHub() {
  return (
    <section className={styles.section} id="tools" aria-labelledby="tools-heading">
      <AnimatedSection>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.label}>⚡ Free Tools</span>
            <h2 id="tools-heading" className={styles.heading}>
              Explore the Ecosystem
            </h2>
            <p className={styles.subtitle}>
              Utilities and platforms designed to solve real problems — open, fast, no signup.
            </p>
          </div>

          <div className={styles.grid}>
            {tools.map((tool) => {
              const CardTag = tool.external ? "a" : Link;
              const linkProps = tool.external
                ? { href: tool.url }
                : { to: tool.url };

              return (
                <CardTag
                  key={tool.id}
                  {...linkProps}
                  className={styles.card}
                  aria-label={`Open ${tool.name}`}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <i className={tool.icon} aria-hidden="true"></i>
                    </div>
                    {tool.badge && (
                      <span className={styles.badge}>{tool.badge}</span>
                    )}
                  </div>
                  <h3 className={styles.cardName}>{tool.name}</h3>
                  <p className={styles.cardDesc}>{tool.desc}</p>
                  <span className={styles.cardAction}>
                    Open <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </span>
                </CardTag>
              );
            })}
          </div>

          <div className={styles.allTools}>
            <Link to="/tools" className={styles.allToolsLink}>
              View all tools & platforms <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
