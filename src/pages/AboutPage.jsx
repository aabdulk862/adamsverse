import { Link } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/images/profile.JPEG";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";
import styles from "./AboutPage.module.css";

const credentials = [
  { label: "Current", value: "Software Engineer — Charter Communications" },
  { label: "Education", value: "B.S. Computer Science" },
  { label: "Stack", value: "React, Spring Boot, AWS, PostgreSQL" },
];

const workCards = [
  {
    title: "Direct communication",
    desc: "You talk to the person building it. No layers, no waiting on someone to get back to you.",
  },
  {
    title: "Built to last",
    desc: "Same engineering standards I use at my day job. Things work properly the first time.",
  },
  {
    title: "One point of contact",
    desc: "Design, development, deployment — all one person. Nothing gets lost in translation.",
  },
  {
    title: "Ships complete",
    desc: "Analytics, SEO, and at least one real integration. Every project launches ready to work.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About — Adverse Solutions | Charlotte, NC";
  }, []);

  return (
    <div className={styles.page}>
      {/* Bio zone */}
      <section className={styles.bioZone}>
        <div className={styles.bioHeader}>
          <img
            src={logo}
            alt="Adam Abdulkadir"
            className={styles.avatar}
            loading="lazy"
            decoding="async"
          />
          <div className={styles.bioInfo}>
            <h1 className={styles.name}>
              Adam Abdulkadir
              <img src={usa} alt="US" className={styles.flag} loading="lazy" decoding="async" />
              <img src={eritrea} alt="Eritrea" className={styles.flag} loading="lazy" decoding="async" />
            </h1>
            <p className={styles.role}>Software engineer · Charlotte, NC</p>
            <span className={styles.availability}>
              <span className={styles.dot}></span> Available for projects
            </span>
          </div>
        </div>

        <div className={styles.bioText}>
          <p>
            I build systems for a living — the last few years at Charter
            Communications, working on infrastructure that processes millions of
            messages daily. It's taught me how to build things that hold up under
            real pressure.
          </p>
          <p>
            Adverse is the work I do for smaller clients. Websites, platforms,
            technical systems — for businesses that want something built well
            without the overhead of a big agency. I genuinely enjoy this work.
          </p>
          <p>
            It's just me, which means you're never waiting on someone else to
            relay a message or approve a decision. We talk directly, things move
            fast, and I'm personally invested in the outcome.
          </p>
        </div>

        {/* Credential strip */}
        <div className={styles.credentials}>
          {credentials.map((cred) => (
            <div key={cred.label} className={styles.credItem}>
              <span className={styles.credLabel}>{cred.label}</span>
              <span className={styles.credValue}>{cred.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLabel}>How I work</span>
      </div>

      {/* Work cards */}
      <section className={styles.workGrid}>
        {workCards.map((card) => (
          <div key={card.title} className={styles.workCard}>
            <h3 className={styles.workCardTitle}>{card.title}</h3>
            <p className={styles.workCardDesc}>{card.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA block */}
      <section className={styles.ctaBlock}>
        <p className={styles.ctaText}>
          Have something in mind? I'm happy to talk through it — even if you're
          not sure exactly what you need yet.
        </p>
        <Link to="/contact" className={styles.ctaBtn}>
          Get in touch <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </Link>
      </section>
    </div>
  );
}
