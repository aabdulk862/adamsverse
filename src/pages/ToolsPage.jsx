import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./ToolsPage.module.css";

const tools = [
  {
    id: "website-packages",
    name: "Website Packages",
    desc: "Production-ready business websites tailored for your industry. Preview live, pick a theme, launch in days.",
    icon: "fas fa-layer-group",
    url: "/packages",
    status: "Live",
    category: "Business",
    featured: true,
    cta: "Browse Packages",
    isRewrite: false,
  },
  {
    id: "pdf-editor",
    name: "PDF Editor",
    desc: "Merge, split, annotate, and convert documents — entirely in the browser, no signup required.",
    icon: "fas fa-file-pdf",
    url: "https://pdf-local.netlify.app",
    status: "Beta",
    category: "Utilities",
    featured: false,
    cta: "Open Tool",
    isRewrite: true,
  },
  {
    id: "basecamp-atlas",
    name: "Basecamp Atlas",
    desc: "Apartment and retreat discovery with interactive maps, smart filters, and neighborhood insights.",
    icon: "fas fa-map-marked-alt",
    url: "https://basecamp-atlas.netlify.app",
    status: "Live",
    category: "Business",
    featured: false,
    cta: "Launch Atlas",
    isRewrite: true,
  },
];

const categories = ["All", "Business", "Utilities"];

const roadmap = [
  { name: "AI Workflow Tools", status: "In Development" },
  { name: "Business Automation Suite", status: "Planned" },
  { name: "Invoice & Billing System", status: "Planned" },
  { name: "Social Media Generator", status: "Exploring" },
];

export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    document.title = "Tools & Platforms — Adverse Solutions";
  }, []);

  const filtered = activeFilter === "All"
    ? tools
    : tools.filter((t) => t.category === activeFilter);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className={styles.heroLabel}>⚡ Adverse Ecosystem</span>
          <h1 className={styles.heroHeading}>Tools & Platforms</h1>
          <p className={styles.heroSubtitle}>
            Software designed to help businesses and developers move faster.
            Open, fast, built to solve real problems.
          </p>
          <div className={styles.heroActions}>
            <Link to="/packages" className={styles.btnPrimary}>
              Explore Packages
            </Link>
            <Link to="/services" className={styles.btnSecondary}>
              View Services
            </Link>
          </div>
          <p className={styles.heroCredibility}>
            Built with enterprise engineering standards — Charter Communications background
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className={styles.filterSection}>
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterActive : ""}`}
              onClick={() => setActiveFilter(cat)}
              aria-pressed={activeFilter === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {filtered.map((tool, i) => {
            const isRewrite = tool.isRewrite;
            const CardTag = isRewrite ? "a" : Link;
            const linkProps = isRewrite
              ? { href: tool.url, target: "_blank", rel: "noopener noreferrer" }
              : { to: tool.url };

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <CardTag
                  {...linkProps}
                  className={`${styles.card} ${tool.featured ? styles.cardFeatured : ""}`}
                  aria-label={`${tool.cta} — ${tool.name}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      <i className={tool.icon} aria-hidden="true"></i>
                    </div>
                    <span className={`${styles.badge} ${styles[`badge${tool.status.replace(/\s/g, "")}`] || ""}`}>
                      {tool.status}
                    </span>
                  </div>
                  <h3 className={styles.cardName}>{tool.name}</h3>
                  <p className={styles.cardDesc}>{tool.desc}</p>
                  <span className={styles.cardCta}>
                    {tool.cta} <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </span>
                </CardTag>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Philosophy */}
      <section className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <h2 className={styles.philosophyHeading}>Why we build these</h2>
          <div className={styles.philosophyGrid}>
            <p>
              Software should reduce friction, not create it. Every tool here
              exists because we hit a problem and built the solution we wished
              existed.
            </p>
            <p>
              Businesses deserve modern systems without enterprise complexity or
              enterprise pricing. Developers deserve references that are actually
              useful, not textbook abstractions.
            </p>
          </div>
        </div>
      </section>

      {/* Learn & Resources */}
      <section className={styles.learnSection}>
        <div className={styles.learnInner}>
          <div className={styles.learnHeader}>
            <h2 className={styles.learnHeading}>Learn & Resources</h2>
            <p className={styles.learnSubtitle}>
              Guides for developers, founders, and businesses exploring modern software systems.
            </p>
          </div>
          <div className={styles.learnGrid}>
            <a href="https://ultimate-studyguide.netlify.app" target="_blank" rel="noopener noreferrer" className={styles.learnCard}>
              <i className="fas fa-book-open" aria-hidden="true"></i>
              <span>CS Reference Guide</span>
            </a>
            <a href="/ai-website" target="_blank" rel="noopener noreferrer" className={styles.learnCard}>
              <i className="fas fa-robot" aria-hidden="true"></i>
              <span>Build a Website with AI</span>
            </a>
            <a href="/dsa" target="_blank" rel="noopener noreferrer" className={styles.learnCard}>
              <i className="fas fa-sitemap" aria-hidden="true"></i>
              <span>DSA & Algorithms</span>
            </a>
            <a href="/github" target="_blank" rel="noopener noreferrer" className={styles.learnCard}>
              <i className="fab fa-github" aria-hidden="true"></i>
              <span>GitHub Workflow</span>
            </a>
            <Link to="/learn" className={styles.learnCard}>
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
              <span>All Guides</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className={styles.roadmap}>
        <div className={styles.roadmapInner}>
          <div className={styles.roadmapHeader}>
            <h2 className={styles.roadmapHeading}>What's next</h2>
            <p className={styles.roadmapSubtitle}>
              The ecosystem is growing. Here's what we're working toward.
            </p>
          </div>
          <div className={styles.roadmapGrid}>
            {roadmap.map((item) => (
              <div key={item.name} className={styles.roadmapCard}>
                <span className={styles.roadmapStatus}>{item.status}</span>
                <h3 className={styles.roadmapName}>{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaHeading}>Need something custom?</h2>
          <p className={styles.ctaDesc}>
            Have an operational problem that doesn't fit a pre-built tool?
            Let's talk about building the right system for your business.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/contact" className={styles.btnPrimary}>
              Start a Conversation <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/packages" className={styles.btnGhost}>
              Browse Packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
